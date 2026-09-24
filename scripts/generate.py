"""Amber command-centre profile generator. Fetches live GitHub data, renders animated SVG cards into /generated."""
import os, re, json, math, random, datetime as dt, urllib.request, functools
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "generated")
CFG = json.load(open(os.path.join(ROOT, "profile.json")))
A, MID, DIM, DARK, BG, PANEL = "#ffb000", "#c98a00", "#8a6200", "#3d2a00", "#0b0805", "#120d06"

# ---------------- fonts ----------------
FONT_DIR = os.path.join(ROOT, "scripts", ".fonts")
FONTS = {"mono": "jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf", "grotesk": "spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf"}
def _font_path(key):
    os.makedirs(FONT_DIR, exist_ok=True)
    p = os.path.join(FONT_DIR, key + ".ttf")
    if not os.path.exists(p):
        urllib.request.urlretrieve("https://github.com/google/fonts/raw/main/ofl/" + FONTS[key], p)
    return p
@functools.lru_cache(None)
def font(key, w):
    return instantiateVariableFont(TTFont(_font_path(key)), {"wght": w})
def _r(d): return re.sub(r"(\d+\.\d)\d+", r"\1", d)
def text(s, x, y, size=16, fill=A, w=500, f="mono", anchor="start", track=0, extra=""):
    fo = font(f, w); cmap = fo.getBestCmap(); gs = fo.getGlyphSet(); upm = fo["head"].unitsPerEm; hm = fo["hmtx"]; sc = size / upm
    adv, items = 0, []
    for ch in s:
        g = cmap.get(ord(ch)) or cmap[32]; items.append((g, adv)); adv += hm[g][0] + track / sc
    width = (adv - track / sc) * sc if s else 0
    ox = {"start": 0, "middle": -width / 2, "end": -width}[anchor]
    pen = SVGPathPen(gs)
    for g, a in items: gs[g].draw(TransformPen(pen, (sc, 0, 0, -sc, x + ox + a * sc, y)))
    d = _r(pen.getCommands())
    return (f'<path d="{d}" fill="{fill}" {extra}/>' if d else ""), width
def T(*a, **k): return text(*a, **k)[0]
def W(s, size=16, w=500, f="mono", track=0): return text(s, 0, 0, size, w=w, f=f, track=track)[1]

# ---------------- shared chrome ----------------
def defs_common():
    return f'''<filter id="gl" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="2.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="2" fill="#000" opacity="0.35"/></pattern>
<radialGradient id="vig" cx="50%" cy="50%" r="78%"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.65"/></radialGradient>'''
def card(w, h, body, title, extra_defs="", border=True, roll=6):
    b = f'<rect x="0.5" y="0.5" width="{w-1}" height="{h-1}" rx="12" fill="none" stroke="{DARK}"/>' if border else ""
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" aria-label="{title}"><title>{title}</title>
<defs>{defs_common()}{extra_defs}<clipPath id="card"><rect width="{w}" height="{h}" rx="12"/></clipPath></defs>
<g clip-path="url(#card)"><rect width="{w}" height="{h}" fill="{BG}"/>{body}
<g><rect y="-8" width="{w}" height="{h+16}" fill="url(#scan)"/><animateTransform attributeName="transform" type="translate" values="0,0;0,4" dur="0.25s" repeatCount="indefinite"/></g>
<rect width="{w}" height="{max(40,h//6)}" fill="{A}" opacity="0.045"><animate attributeName="y" values="-{max(40,h//6)};{h}" dur="{roll}s" repeatCount="indefinite"/></rect>
<rect width="{w}" height="{h}" fill="url(#vig)"/></g>{b}</svg>'''
def flicker(inner, dur=3.3):
    return f'<g filter="url(#gl)">{inner}<animate attributeName="opacity" values="1;0.86;1;1;0.93;1" dur="{dur}s" repeatCount="indefinite"/></g>'
def cursor(x, y, h=18, w=10):
    return f'<rect x="{x:.0f}" y="{y-h+3:.0f}" width="{w}" height="{h}" fill="{A}" filter="url(#gl)"><animate attributeName="opacity" values="1;0" calcMode="discrete" dur="0.9s" repeatCount="indefinite"/></rect>'
def marquee(s, y, size, fill, dur, w=600, reverse=False):
    p, wd = text(s, 0, y, size, fill, w)
    a, b = ("0,0", f"{-wd:.0f},0") if not reverse else (f"{-wd:.0f},0", "0,0")
    return f'<g>{p}<g transform="translate({wd:.0f},0)">{p}</g><g transform="translate({2*wd:.0f},0)">{p}</g><animateTransform attributeName="transform" type="translate" values="{a};{b}" dur="{dur}s" repeatCount="indefinite"/></g>'
_uid = [0]
def uid(p="u"): _uid[0] += 1; return f"{p}{_uid[0]}"
def odometer(value, x, y, size=36, period=10, delay=0):
    """Rolls digits from spinning to the real value, holds, re-rolls every `period` seconds."""
    s = f"{value:,}"; out = []; dw = size * 0.6; h = size * 1.2; cx = x
    for i, ch in enumerate(s):
        if not ch.isdigit():
            out.append(T(ch, cx, y, size, A, 700)); cx += dw; continue
        d = int(ch); loops = 2 + (len(s) - i) % 3; total = loops * 10 + d
        strip = "".join(T(str(k % 10), 0, k * h, size, A, 700) for k in range(total + 1))
        cid = uid("od"); land = 0.18 + 0.04 * i
        out.append(f'<clipPath id="{cid}"><rect x="{cx:.1f}" y="{y-size:.1f}" width="{dw:.1f}" height="{h:.1f}"/></clipPath><g clip-path="url(#{cid})"><g transform="translate({cx:.1f},{y})"><g>{strip}'
                   f'<animateTransform attributeName="transform" type="translate" values="0,0;0,{-total*h:.1f};0,{-total*h:.1f}" keyTimes="0;{land:.2f};1" calcMode="spline" keySplines="0.15 0.6 0.3 1;0 0 1 1" dur="{period}s" begin="{delay:.2f}s" repeatCount="indefinite"/></g></g></g>')
        cx += dw
    return "".join(out), cx - x

# ---------------- data ----------------
def gql(q, v):
    tok = os.environ.get("GITHUB_TOKEN")
    req = urllib.request.Request("https://api.github.com/graphql", json.dumps({"query": q, "variables": v}).encode(),
                                 {"Authorization": f"bearer {tok}", "Content-Type": "application/json"})
    r = json.load(urllib.request.urlopen(req))
    if "errors" in r: raise SystemExit(r["errors"])
    return r["data"]
def fetch():
    if os.environ.get("PROFILE_FAKE_DATA"):
        return json.load(open(os.environ["PROFILE_FAKE_DATA"]))
    login = CFG["login"]
    u = gql("""query($l:String!){user(login:$l){createdAt followers{totalCount}
      repositories(ownerAffiliations:OWNER,privacy:PUBLIC,first:100,orderBy:{field:PUSHED_AT,direction:DESC}){totalCount
        nodes{name description homepageUrl url stargazerCount isFork pushedAt primaryLanguage{name}}}
      contributionsCollection{restrictedContributionsCount contributionCalendar{totalContributions weeks{contributionDays{contributionCount date}}}}}}""", {"l": login})["user"]
    start = int(u["createdAt"][:4]); now = dt.datetime.now(dt.timezone.utc).year; alltime = 0
    for y in range(start, now + 1):
        c = gql("""query($l:String!,$f:DateTime!,$t:DateTime!){user(login:$l){contributionsCollection(from:$f,to:$t){contributionCalendar{totalContributions}}}}""",
                {"l": login, "f": f"{y}-01-01T00:00:00Z", "t": f"{y}-12-31T23:59:59Z"})
        alltime += c["user"]["contributionsCollection"]["contributionCalendar"]["totalContributions"]
    cal = u["contributionsCollection"]["contributionCalendar"]
    days = [(d["date"], d["contributionCount"]) for w in cal["weeks"] for d in w["contributionDays"]]
    repos = [r for r in u["repositories"]["nodes"] if not r["isFork"]]
    return {"alltime": alltime, "year": cal["totalContributions"], "days": days, "repos": repos,
            "repo_count": u["repositories"]["totalCount"], "since": u["createdAt"][:10]}

def streaks(days):
    cur = best = run = 0
    for _, c in days:
        run = run + 1 if c else 0; best = max(best, run)
    for _, c in reversed(days):
        if c: cur += 1
        elif cur or _ != days[-1][0]: break
    return cur, best

# ---------------- cards ----------------
def header(D):
    w, h = 1200, 360
    live = [r for r in D["repos"] if r.get("homepageUrl")]
    counters = [("CONTRIBUTIONS", D["alltime"]), ("REPOSITORIES", D["repo_count"]), ("LIVE BUILDS", len(live))]
    if CFG.get("users"): counters.append((CFG.get("users_label", "USERS"), int(CFG["users"])))
    radar = 1010 if len(counters) <= 3 else 1060
    ticker = "  >>  ".join(CFG["ticker"]) + "  >>  "
    b = [f'<rect width="{w}" height="34" fill="#140e04"/>', flicker(marquee(ticker, 23, 14, A, 14))]
    b.append(flicker(T(CFG["name"].upper(), 56, 128, 56, A, 800) + T(CFG["tagline"], 58, 166, 18, MID, 400)))
    b.append(cursor(58 + W(CFG["tagline"], 18, 400) + 6, 166, 20, 11))
    x = 58; gap = 215 if len(counters) <= 3 else 205
    for i, (lab, val) in enumerate(counters):
        b.append(T(lab, x, 236, 12, DIM, 500))
        od, _ = odometer(val, x, 284, 36 if len(counters) <= 3 else 32, delay=i * 0.35)
        b.append(flicker(od))
        x += gap if val < 10000 else gap + 20
    cx, cy, r = radar, 200, 118
    b.append("".join(f'<circle cx="{cx}" cy="{cy}" r="{r*k/4:.0f}" fill="none" stroke="{DARK}"/>' for k in range(1, 5)))
    b.append(f'<line x1="{cx-r}" y1="{cy}" x2="{cx+r}" y2="{cy}" stroke="{DARK}"/><line x1="{cx}" y1="{cy-r}" x2="{cx}" y2="{cy+r}" stroke="{DARK}"/>')
    e = math.radians(-40)
    b.append(f'<g><path d="M{cx},{cy} L{cx+r},{cy} A{r},{r} 0 0,0 {cx+r*math.cos(e):.1f},{cy+r*math.sin(e):.1f} Z" fill="url(#sweep)"/><line x1="{cx}" y1="{cy}" x2="{cx+r}" y2="{cy}" stroke="{A}" stroke-width="2" filter="url(#gl)"/><animateTransform attributeName="transform" type="rotate" from="0 {cx} {cy}" to="360 {cx} {cy}" dur="4s" repeatCount="indefinite"/></g>')
    random.seed(3)
    for _ in range(10):
        ang = random.uniform(0, 360); rr = random.uniform(25, r - 10)
        b.append(f'<circle cx="{cx+rr*math.cos(math.radians(ang)):.0f}" cy="{cy+rr*math.sin(math.radians(ang)):.0f}" r="4" fill="{A}" filter="url(#gl)" opacity="0"><animate attributeName="opacity" values="1;0.15;0" keyTimes="0;0.7;1" dur="4s" begin="{ang/360*4:.2f}s" repeatCount="indefinite"/></circle>')
    sweep = f'<linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="{A}" stop-opacity="0"/><stop offset="1" stop-color="{A}" stop-opacity="0.55"/></linearGradient>'
    return card(w, h, "".join(b), f"{CFG['name']}, revenue infrastructure engineer, Pretoria, South Africa", sweep, border=False, roll=5)

def section(label):
    w, h = 1200, 56
    p, wd = text(f"> {label}", 24, 36, 20, A, 700)
    body = flicker(p) + cursor(24 + wd + 8, 36, 20, 11) + f'<line x1="{24+wd+36:.0f}" y1="29" x2="1176" y2="29" stroke="{DARK}" stroke-dasharray="2 6"><animate attributeName="stroke-dashoffset" values="0;-16" dur="0.8s" repeatCount="indefinite"/></line>'
    return card(w, h, body, label.lower(), border=False, roll=3)

def activity(D):
    w, h = 1200, 250
    days = D["days"][-371:]; cur, best = streaks(D["days"])
    mx = max([c for _, c in days] + [1])
    x0, y0, cs = 40, 76, 16
    nz = sorted(c for _, c in days if c) or [1]
    q = [nz[int(len(nz) * f)] for f in (0.25, 0.5, 0.75)]
    lv = lambda c: 0 if c == 0 else 1 + sum(c > t for t in q)
    shades = [PANEL, "#4a3300", "#8a6200", "#cc8f00", A]
    cells = []
    first = dt.date.fromisoformat(days[0][0]); off = (first.weekday() + 1) % 7
    ncols = 0
    for i, (d, c) in enumerate(days):
        k = i + off; col, row = k // 7, k % 7; ncols = max(ncols, col + 1)
        x = x0 + col * (cs + 4); y = y0 + row * (cs + 4); l = lv(c); t = col / 54 * 6
        glow = f'<animate attributeName="opacity" values="1;0.55;1" keyTimes="0;0.5;1" dur="6s" begin="{t:.2f}s" repeatCount="indefinite"/>' if l else ""
        cells.append(f'<rect x="{x}" y="{y}" width="{cs}" height="{cs}" rx="3" fill="{shades[l]}">{glow}</rect>')
    gw = ncols * (cs + 4)
    scan = f'<rect x="{x0-30}" y="{y0-6}" width="30" height="{7*(cs+4)+8}" fill="url(#beam)"><animate attributeName="x" values="{x0-30};{x0+gw}" dur="6s" repeatCount="indefinite"/></rect>'
    beam = f'<linearGradient id="beam" x1="0" x2="1"><stop offset="0" stop-color="{A}" stop-opacity="0"/><stop offset="1" stop-color="{A}" stop-opacity="0.35"/></linearGradient>'
    stats = [("LAST 12 MONTHS", f"{D['year']:,}"), ("SINCE " + D["since"][:4], f"{D['alltime']:,}"), ("CURRENT STREAK", f"{cur}d"), ("LONGEST STREAK", f"{best}d")]
    top = "".join(T(lab, 40 + i * 290, 30, 12, DIM, 500) + flicker(T(v, 40 + i * 290, 58, 24, A, 700)) for i, (lab, v) in enumerate(stats))
    return card(w, h, top + "".join(cells) + scan, "contribution activity", beam)

def pipeline():
    w, h = 1200, 170; st = CFG["pipeline"]; n = len(st); bw = 190; gap = (1200 - 80 - n * bw) / (n - 1); y = 62
    b = []
    xs = [40 + i * (bw + gap) for i in range(n)]
    for i in range(n - 1):
        x1 = xs[i] + bw; x2 = xs[i + 1]
        b.append(f'<line x1="{x1}" y1="{y+22}" x2="{x2}" y2="{y+22}" stroke="{DIM}" stroke-dasharray="3 5"><animate attributeName="stroke-dashoffset" values="0;-16" dur="0.6s" repeatCount="indefinite"/></line>')
    path = f"M{xs[0]+bw/2},{y+22} H{xs[-1]+bw/2}"
    for k in range(3):
        b.append(f'<circle r="5" fill="{A}" filter="url(#gl)"><animateMotion path="{path}" dur="4.5s" begin="{k*1.5}s" repeatCount="indefinite"/></circle>')
    for i, (x, s) in enumerate(zip(xs, st)):
        last = i == n - 1
        b.append(f'<rect x="{x}" y="{y}" width="{bw}" height="44" rx="4" fill="{A if last else BG}" stroke="{A}" stroke-opacity="0.5"><animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="4.5s" begin="{i*4.5/(n-1):.2f}s" repeatCount="indefinite"/></rect>')
        b.append(T(s, x + bw / 2, y + 28, 15, BG if last else A, 700, anchor="middle"))
    b.append(T("cost per closed sale feeds back into bidding", 600, 148, 13, DIM, 400, anchor="middle"))
    b.append(f'<path d="M{xs[-1]+bw/2},{y+48} V{y+68} H{xs[0]+bw/2} V{y+48}" fill="none" stroke="{DARK}" stroke-width="1.5" stroke-dasharray="3 5"><animate attributeName="stroke-dashoffset" values="0;16" dur="0.6s" repeatCount="indefinite"/></path>')
    return card(w, h, flicker("".join(b)), "pipeline: " + " to ".join(st).lower())

def tile(title, line, tag, meta, idx):
    w, h = 580, 150
    b = [T(tag, 24, 34, 12, BG, 700, extra="")]
    tw = W(tag, 12, 700) + 16
    b.insert(0, f'<rect x="18" y="20" width="{tw:.0f}" height="20" rx="3" fill="{A}"/>')
    b.append(f'<circle cx="548" cy="30" r="5" fill="{A}" filter="url(#gl)"><animate attributeName="opacity" values="1;0.2;1" dur="1.6s" begin="{idx*0.3:.1f}s" repeatCount="indefinite"/></circle>')
    b.append(flicker(T(title[:30], 24, 82, 28, A, 700), 3 + idx * 0.4))
    b.append(T(line[:62], 24, 112, 14, MID, 400))
    b.append(T(meta[:64], 24, 136, 12, DIM, 400))
    return card(w, h, "".join(b), title, roll=4 + idx % 3)

def systems():
    rows = CFG["systems"]; w, h = 1200, 60 + 36 * len(rows)
    b = [T("$ cat systems.txt", 32, 36, 14, DIM, 500)]
    per = 1.2
    for i, (k, v) in enumerate(rows):
        y = 74 + i * 36
        line = T(k, 32, y, 16, A, 700) + T(v, 290, y, 16, MID, 400)
        b.append(f'<g opacity="0">{line}<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;{i*per/12:.3f};{(i*per+0.1)/12:.3f};0.92;1" dur="12s" repeatCount="indefinite"/></g>')
    return card(w, h, flicker("".join(b)), "systems i ship")

def stack():
    groups = CFG["stack"]; w = 1200; rows = max(len(v) for v in groups.values()); h = 70 + rows * 30
    b = []; colw = 1200 / len(groups)
    for gi, (g, items) in enumerate(groups.items()):
        x = 32 + gi * colw
        b.append(flicker(T(f"[{g}]", x, 40, 16, A, 800)))
        for i, it in enumerate(items):
            y = 76 + i * 30
            b.append(T(f"{i:02d}", x, y, 14, DARK, 500) + T(it, x + 34, y, 16, MID, 500))
            b.append(f'<rect x="{x+34+W(it,16)+8:.0f}" y="{y-11}" width="8" height="12" fill="{A}" opacity="0"><animate attributeName="opacity" values="0;1;0" dur="{len(items)*0.5}s" begin="{i*0.5+gi*0.17:.2f}s" repeatCount="indefinite"/></rect>')
    return card(w, h, "".join(b), "stack")

def footer():
    ps = CFG["principles"]; w, h = 1200, 130
    b = []
    for i, (a, bb) in enumerate(ps):
        x = 32 + (i % 2) * 590; y = 48 + (i // 2) * 44
        b.append(T(a, x, y, 22, A, 800) + T(">", x + 250, y, 22, MID, 700) + T(bb, x + 290, y, 22, DIM, 500))
    b.append(T("open to conversations on call-centre automation, lead-gen infrastructure and AI in regulated financial services", 600, 120, 12, DIM, 400, anchor="middle"))
    return card(w, h, flicker("".join(b)), "principles")

# ---------------- run ----------------
def main():
    os.makedirs(OUT, exist_ok=True)
    D = fetch()
    files = {"header.svg": header(D), "activity.svg": activity(D), "pipeline.svg": pipeline(), "systems.svg": systems(),
             "stack.svg": stack(), "footer.svg": footer()}
    for s in ["ACTIVITY", "PIPELINE", "OPERATING", "LIVE_BUILDS", "SYSTEMS", "STACK"]:
        files[f"h-{s.lower()}.svg"] = section(s)
    live = [r for r in D["repos"] if r.get("homepageUrl")][:6]
    if len(live) > 1 and len(live) % 2: live = live[:-1]
    ven = list(CFG["ventures"])
    if len(ven) % 2 and CFG.get("filler"): ven.append(CFG["filler"])
    for i, v in enumerate(ven):
        files[f"venture-{i}.svg"] = tile(v["name"], v["line"], v["tag"], v["url"].replace("https://", ""), i)
    for i, r in enumerate(live):
        lang = (r.get("primaryLanguage") or {}).get("name") or "web"
        files[f"build-{i}.svg"] = tile(r["name"], r.get("description") or r["name"], "LIVE", f"{lang.lower()} / {r['homepageUrl'].replace('https://','')}", i + 5)
    for f in os.listdir(OUT):
        if f.startswith(("build-", "venture-")) and f not in files: os.remove(os.path.join(OUT, f))
    for n, s in files.items(): open(os.path.join(OUT, n), "w").write(s)
    json.dump({"ventures": CFG["ventures"], "builds": [{"name": r["name"], "url": r["homepageUrl"], "repo": r["url"]} for r in live],
               "updated": dt.datetime.now(dt.timezone.utc).replace(tzinfo=None).isoformat(timespec="minutes") + "Z"}, open(os.path.join(OUT, "manifest.json"), "w"), indent=1)
    write_readme(live, ven)

def write_readme(live, vens):
    def pair(items):
        rows = []
        for i in range(0, len(items), 2):
            cells = "".join(f'<td width="50%"><a href="{u}"><img src="{src}" width="100%" alt="{alt}"></a></td>' for src, u, alt in items[i:i+2])
            rows.append(f"<tr>{cells}</tr>")
        return "<table>" + "".join(rows) + "</table>"
    b = lambda l, logo, url: f'<a href="{url}"><img src="https://img.shields.io/badge/{l.replace(" ","%20")}-0b0805?style=for-the-badge&logo={logo}&logoColor=ffb000&labelColor=0b0805&color=0b0805" alt="{l}"></a>'
    ven = pair([(f"generated/venture-{i}.svg", v["url"], v["name"]) for i, v in enumerate(vens)])
    bld = pair([(f"generated/build-{i}.svg", r["homepageUrl"], r["name"]) for i, r in enumerate(live)])
    md = f'''<div align="center">

<img src="generated/header.svg" width="100%" alt="{CFG['name']}, revenue infrastructure engineer, Pretoria, South Africa">

{b("Email","gmail","mailto:franz@sigsolutions.co.za")} {b("SIG Solutions","googlechrome","https://sigsolutions.co.za")} {b("LinkedIn","linkedin","https://linkedin.com/in/franzbadenhorst")} {b("@FranzSalesSense","x","https://x.com/FranzSalesSense")}

<img src="generated/h-activity.svg" width="100%" alt="activity">
<img src="generated/activity.svg" width="100%" alt="contribution activity">

<img src="generated/h-pipeline.svg" width="100%" alt="pipeline">
<img src="generated/pipeline.svg" width="100%" alt="Meta ads to contact database to ViciDial to agent and AI to closed sale">

<img src="generated/h-operating.svg" width="100%" alt="operating">

{ven}

<img src="generated/h-live_builds.svg" width="100%" alt="live builds">

{bld}

<img src="generated/h-systems.svg" width="100%" alt="systems">
<img src="generated/systems.svg" width="100%" alt="systems i ship">

<img src="generated/h-stack.svg" width="100%" alt="stack">
<img src="generated/stack.svg" width="100%" alt="stack">

<img src="generated/footer.svg" width="100%" alt="principles">

</div>
'''
    open(os.path.join(ROOT, "README.md"), "w").write(md)

if __name__ == "__main__":
    main()
