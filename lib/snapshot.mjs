// Repositories are read through \`viewer\` (the token's owner): fine-grained
// tokens only expose private repos that way, not through user(login:).
// Pulls everything the profile designs render from GitHub's GraphQL API and
// writes data/snapshot.json. Only aggregates and public repo details leave
// this file: private repos contribute language bytes and dependency names.
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { CATEGORIES, classify } from "./stack-map.mjs";

const TOKEN = process.env.GITHUB_TOKEN;
const LOGIN = process.env.PROFILE_LOGIN || "bully911210";
if (!TOKEN) throw new Error("GITHUB_TOKEN is required");

async function gql(query, variables = {}, attempt = 1) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (res.status >= 500 && attempt < 4) {
    await new Promise((r) => setTimeout(r, 1500 * attempt));
    return gql(query, variables, attempt + 1);
  }
  if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(`GraphQL: ${json.errors.map((e) => e.message).join("; ")}`);
  return json.data;
}

const MANIFESTS = {
  pkg: "HEAD:package.json",
  req: "HEAD:requirements.txt",
  pyproject: "HEAD:pyproject.toml",
  supabase: "HEAD:supabase",
  workflows: "HEAD:.github/workflows",
  docker: "HEAD:Dockerfile",
  vercel: "HEAD:vercel.json",
};
const manifestFields = Object.entries(MANIFESTS)
  .map(([k, expr]) => `${k}: object(expression: "${expr}") { ... on Blob { text } ... on Tree { entries { name } } }`)
  .join("\n");

const REPO_QUERY = `query($after: String) {
  viewer {
    login
    repositories(first: 12, after: $after, ownerAffiliations: OWNER, orderBy: {field: PUSHED_AT, direction: DESC}) {
      pageInfo { hasNextPage endCursor }
      nodes {
        name description homepageUrl isPrivate isFork isArchived stargazerCount forkCount
        createdAt pushedAt diskUsage
        primaryLanguage { name color }
        languages(first: 20, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name color } } }
        repositoryTopics(first: 20) { nodes { topic { name } } }
        latestRelease { tagName publishedAt }
        defaultBranchRef { target { ... on Commit { history { totalCount } } } }
        ${manifestFields}
      }
    }
  }
}`;

const USER_QUERY = `query($login: String!) {
  user(login: $login) {
    login name bio location company websiteUrl twitterUsername createdAt avatarUrl
    followers { totalCount }
    contributionsCollection {
      totalCommitContributions totalPullRequestContributions totalIssueContributions
      totalRepositoryContributions restrictedContributionsCount
      contributionCalendar { totalContributions weeks { contributionDays { date contributionCount weekday } } }
    }
  }
}`;

function depsFrom(node) {
  const names = new Set();
  if (node.pkg?.text) {
    try {
      const pkg = JSON.parse(node.pkg.text);
      for (const block of ["dependencies", "devDependencies"]) Object.keys(pkg[block] || {}).forEach((d) => names.add(d));
    } catch { /* malformed package.json: skip */ }
  }
  for (const text of [node.req?.text, node.pyproject?.text]) {
    if (!text) continue;
    for (const m of text.matchAll(/^\s*["']?([A-Za-z0-9_.-]+)\s*(?:[=<>~!\[;"']|$)/gm)) names.add(m[1].toLowerCase());
  }
  return [...names];
}

async function fetchRepos() {
  const repos = [];
  let after = null;
  do {
    const data = await gql(REPO_QUERY, { after });
    if (data.viewer.login.toLowerCase() !== LOGIN.toLowerCase()) throw new Error(`token belongs to ${data.viewer.login}, not ${LOGIN}`);
    const page = data.viewer.repositories;
    repos.push(...page.nodes);
    after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
  } while (after);
  return repos;
}

function summarise(user, repos) {
  const own = repos.filter((r) => !r.isFork);
  const languages = {};
  for (const r of own) for (const e of r.languages.edges) {
    const l = (languages[e.node.name] ??= { bytes: 0, color: e.node.color, repos: 0 });
    l.bytes += e.size; l.repos += 1;
  }
  const census = {};
  const infra = { supabase: 0, workflows: 0, docker: 0, vercel: 0 };
  for (const r of own) {
    const hits = new Map(depsFrom(r).map(classify).filter(Boolean).map((h) => [h.label, h]));
    for (const hit of hits.values()) {
      const entry = (census[hit.label] ??= { category: hit.category, repos: 0 });
      entry.repos += 1;
    }
    for (const k of Object.keys(infra)) if (r[k]) infra[k] += 1;
  }
  const days = user.contributionsCollection.contributionCalendar.weeks.flatMap((w) => w.contributionDays);
  const commits = own.reduce((n, r) => n + (r.defaultBranchRef?.target?.history?.totalCount || 0), 0);
  const publicRepos = own.filter((r) => !r.isPrivate).map((r) => ({
    name: r.name, description: r.description, homepageUrl: r.homepageUrl, stars: r.stargazerCount,
    language: r.primaryLanguage?.name ?? null, languageColor: r.primaryLanguage?.color ?? null,
    topics: r.repositoryTopics.nodes.map((n) => n.topic.name), pushedAt: r.pushedAt, createdAt: r.createdAt,
    release: r.latestRelease, commits: r.defaultBranchRef?.target?.history?.totalCount ?? 0,
  }));
  return {
    generatedAt: new Date().toISOString(),
    user: {
      login: user.login, name: user.name, bio: user.bio, location: user.location, company: user.company,
      website: user.websiteUrl, twitter: user.twitterUsername, createdAt: user.createdAt, followers: user.followers.totalCount,
    },
    totals: {
      repos: own.length, privateRepos: own.filter((r) => r.isPrivate).length, publicRepos: publicRepos.length,
      commitsOnDefaultBranches: commits,
      contributionsLastYear: user.contributionsCollection.contributionCalendar.totalContributions,
      privateContributionsLastYear: user.contributionsCollection.restrictedContributionsCount,
      prsLastYear: user.contributionsCollection.totalPullRequestContributions,
      reposCreatedLastYear: user.contributionsCollection.totalRepositoryContributions,
      languageBytes: Object.values(languages).reduce((n, l) => n + l.bytes, 0),
    },
    languages: Object.entries(languages).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.bytes - a.bytes),
    stack: Object.entries(census).map(([label, v]) => ({ label, ...v })).sort((a, b) => b.repos - a.repos),
    stackCategories: CATEGORIES,
    infra,
    calendar: days.map((d) => ({ date: d.date, count: d.contributionCount, weekday: d.weekday })),
    publicRepos,
  };
}

const [userData, repos] = await Promise.all([gql(USER_QUERY, { login: LOGIN }), fetchRepos()]);
const snapshot = summarise(userData.user, repos);

// Guard: a token that can only see public repos would silently shrink every
// number on the profile. Refuse to overwrite a snapshot that saw private
// repos with one that sees none, or one that lost most of its repos.
const previousUrl = new URL("../data/snapshot.json", import.meta.url);
if (existsSync(previousUrl)) {
  const prev = JSON.parse(readFileSync(previousUrl, "utf8")).totals;
  const lostPrivate = prev.privateRepos > 0 && snapshot.totals.privateRepos === 0;
  const shrank = snapshot.totals.repos < prev.repos * 0.8;
  if (lostPrivate || shrank) {
    throw new Error(`Snapshot sees ${snapshot.totals.repos} repos (${snapshot.totals.privateRepos} private), previously ${prev.repos} (${prev.privateRepos} private). The token probably lacks access to private repositories; keeping the existing snapshot.`);
  }
}
await mkdir(new URL("../data/", import.meta.url), { recursive: true });
await writeFile(new URL("../data/snapshot.json", import.meta.url), JSON.stringify(snapshot, null, 2));
console.log(`snapshot: ${snapshot.totals.repos} repos, ${snapshot.stack.length} stack entries, ${snapshot.languages.length} languages`);
