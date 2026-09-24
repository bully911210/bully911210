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
        out.append(f'<clipPath id="{cid}"><rect x="{cx:.1f}" y="{y-size:.1f}" width="{dw:.1f}" height="{h:.1f}"/></clipPath><g clip-path="url(#{cid})"><g transform="translate({cx:.1f},{y})"><g transform="translate(0,{-total*h:.1f})">{strip}'
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
        nodes{name description homepageUrl url stargazerCount isFork pushedAt createdAt primaryLanguage{name}}}
      contributionsCollection{restrictedContributionsCount contributionCalendar{totalContributions weeks{contributionDays{contributionCount date}}}}}}""", {"l": login})["user"]
    start = int(u["createdAt"][:4]); now = dt.datetime.now(dt.timezone.utc).year; alltime = 0
    for y in range(start, now + 1):
        c = gql("""query($l:String!,$f:DateTime!,$t:DateTime!){user(login:$l){contributionsCollection(from:$f,to:$t){contributionCalendar{totalContributions}}}}""",
                {"l": login, "f": f"{y}-01-01T00:00:00Z", "t": f"{y}-12-31T23:59:59Z"})
        alltime += c["user"]["contributionsCollection"]["contributionCalendar"]["totalContributions"]
    cal = u["contributionsCollection"]["contributionCalendar"]
    days = [(d["date"], d["contributionCount"]) for w in cal["weeks"] for d in w["contributionDays"]]
    repos = [r for r in u["repositories"]["nodes"] if not r["isFork"] and r["name"] not in CFG.get("exclude_repos", [])]
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
def box(x, y, w, h, label, fill=None, delay=0, period=4.5, size=14, fc=None):
    f = fill or BG
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="4" fill="{f}" stroke="{A}" stroke-opacity="0.45">'
            f'<animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="{period}s" begin="{delay:.2f}s" repeatCount="indefinite"/></rect>'
            + T(label, x + w / 2, y + h / 2 + size * 0.36, size, fc or (BG if fill == A else A), 700, anchor="middle"))
def dash(d, col=DIM, rev=False):
    return f'<path d="{d}" fill="none" stroke="{col}" stroke-width="1.5" stroke-dasharray="3 5"><animate attributeName="stroke-dashoffset" values="0;{16 if rev else -16}" dur="0.6s" repeatCount="indefinite"/></path>'
def packets(path, n=3, dur=6, r=5):
    return "".join(f'<circle r="{r}" fill="{A}" filter="url(#gl)"><animateMotion path="{path}" dur="{dur}s" begin="-{k*dur/n:.2f}s" repeatCount="indefinite"/></circle>' for k in range(n))

def header(D):
    w, h = 1200, 400
    live = [r for r in D["repos"] if r.get("homepageUrl")]
    last = max(D["repos"], key=lambda r: r["pushedAt"]) if D["repos"] else {"name": "-", "pushedAt": "----------"}
    ticker = "  >>  ".join(CFG["ticker"]) + "  >>  "
    b = [f'<rect width="{w}" height="34" fill="#140e04"/>', flicker(marquee(ticker, 23, 14, A, 12))]
    b.append(flicker(T(CFG["name"].upper(), 56, 126, 60, A, 800)))
    b.append(T(CFG["tagline"].upper(), 58, 164, 18, MID, 500))
    th, tw = text(CFG["thesis"], 58, 222, 22, A, 600)
    cid = uid("th")
    b.append(f'<clipPath id="{cid}"><rect x="56" y="196" height="36" width="{tw+4:.0f}"><animate attributeName="width" values="0;{tw+4:.0f};{tw+4:.0f};0" keyTimes="0;0.35;0.9;1" dur="9s" repeatCount="indefinite"/></rect></clipPath>')
    b.append(f'<g clip-path="url(#{cid})" filter="url(#gl)">{th}</g>')
    b.append(f'<rect x="{58+tw+6:.0f}" y="203" width="12" height="24" fill="{A}" filter="url(#gl)"><animate attributeName="x" values="58;{58+tw+6:.0f};{58+tw+6:.0f};58" keyTimes="0;0.35;0.9;1" dur="9s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" calcMode="discrete" dur="0.9s" repeatCount="indefinite"/></rect>')
    x = 58
    for i, (lab, val) in enumerate([("CONTRIBUTIONS", D["alltime"]), ("REPOSITORIES", D["repo_count"]), ("LIVE BUILDS", len(live))] + ([(CFG.get("users_label", "USERS"), int(CFG["users"]))] if CFG.get("users") else [])):
        b.append(T(lab, x, 300, 12, DIM, 500)); od, ow = odometer(val, x, 346, 34, delay=i * 0.35); b.append(flicker(od)); x += max(170, ow + 50)
    px, py, pw, ph = 800, 70, 360, 300
    b.append(f'<rect x="{px}" y="{py}" width="{pw}" height="{ph}" rx="6" fill="{PANEL}" stroke="{DARK}"/>')
    b.append(T("SYSTEM STATE", px + 20, py + 32, 13, DIM, 700) + f'<line x1="{px+20}" y1="{py+46}" x2="{px+pw-20}" y2="{py+46}" stroke="{DARK}"/>')
    rows = [("MODE", CFG["mode"]), ("LOCATION", CFG["location"]), ("PROJECT", "#" + CFG["project"]["number"]), ("STATUS", "ACTIVE"),
            ("LAST PUSH", last["pushedAt"][:10]), ("REPO", last["name"][:18])]
    for i, (k, v) in enumerate(rows):
        yy = py + 84 + i * 36
        b.append(T(k, px + 20, yy, 13, DIM, 500) + T(v, px + 140, yy, 15, A, 700))
        if k == "STATUS":
            b.append(f'<circle cx="{px+140+W(v,15,700)+14:.0f}" cy="{yy-5}" r="5" fill="{A}" filter="url(#gl)"><animate attributeName="opacity" values="1;0.15;1" dur="1.2s" repeatCount="indefinite"/></circle>')
    return card(w, h, "".join(b), f"{CFG['name']}, revenue infrastructure engineer. {CFG['thesis']}", border=False, roll=5)

def section(label, sub=""):
    w, h = 1200, 56
    p, wd = text(f"> {label}", 24, 36, 20, A, 700)
    s2 = T(sub, 1176, 35, 12, DIM, 500, anchor="end") if sub else ""
    end = 1176 - (W(sub, 12) + 24 if sub else 0)
    body = flicker(p) + cursor(24 + wd + 8, 36, 20, 11) + s2 + f'<line x1="{24+wd+36:.0f}" y1="29" x2="{end:.0f}" y2="29" stroke="{DARK}" stroke-dasharray="2 6"><animate attributeName="stroke-dashoffset" values="0;-16" dur="0.8s" repeatCount="indefinite"/></line>'
    return card(w, h, body, label.lower(), border=False, roll=3)

def opmodel():
    M = CFG["opmodel"]; w, h = 1200, 350; bw, bh = 170, 44
    xs = [40 + i * 230 for i in range(5)]; y1, y2 = 50, 230
    b = []
    for i in range(4): b.append(dash(f"M{xs[i]+bw},{y1+bh/2} H{xs[i+1]}"))
    dx = xs[4] + bw / 2; ai_y, hu_y = 150, 250
    b.append(dash(f"M{dx},{y1+bh} V{ai_y}")); b.append(dash(f"M{xs[4]+bw},{y1+bh/2} H{xs[4]+bw+18} V{hu_y+bh/2} H{xs[4]+bw}"))
    sx = xs[3]
    b.append(dash(f"M{xs[4]},{ai_y+bh/2} H{sx+bw+30} V{y2-10+bh/2} H{sx+bw}")); b.append(dash(f"M{xs[4]},{hu_y+bh/2} H{sx+bw+30} V{y2-10+bh/2}"))
    r2 = [xs[3], xs[2], xs[1]]
    for i in range(2): b.append(dash(f"M{r2[i]},{y2-10+bh/2} H{r2[i+1]+bw}"))
    b.append(dash(f"M{xs[1]+bw/2},{y2-10} V{y1+bh}", A))
    b.append(T(M["return"], xs[1] + bw / 2 + 10, (y1 + bh + y2 - 10) / 2 + 4, 12, MID, 500))
    main = (f"M{xs[0]+bw/2},{y1+bh/2} H{dx} V{ai_y+bh/2} H{sx+bw+30} V{y2-10+bh/2} H{xs[1]+bw/2} V{y1+bh/2}")
    alt = (f"M{dx},{y1+bh/2} H{xs[4]+bw+18} V{hu_y+bh/2} H{sx+bw+30} V{y2-10+bh/2} H{xs[1]+bw/2} V{y1+bh/2} H{dx}")
    b.append(packets(main, 3, 7)); b.append(packets(alt, 2, 6, 4))
    for i, lab in enumerate(M["row1"]): b.append(box(xs[i], y1, bw, bh, lab, delay=i * 0.6, period=7))
    b.append(box(xs[4], ai_y, bw, bh, M["split"][0], delay=3.1, period=7)); b.append(box(xs[4], hu_y, bw, bh, M["split"][1], delay=3.3, period=7))
    for i, lab in enumerate(M["row2"]):
        b.append(box(r2[i], y2 - 10, bw, bh, lab, fill=A if i == 0 else None, delay=4 + i * 0.6, period=7))
    b.append(T("the technology is interchangeable. the architecture isn't.", 40, 330, 13, DIM, 400))
    return card(w, h, flicker("".join(b)), "operating model: " + " to ".join(M["row1"] + M["row2"]).lower())

def loop():
    L = CFG["loop"]; w, h = 1200, 320; cx, cy, r = 300, 160, 112; n = len(L["nodes"])
    b = [f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{DIM}" stroke-width="1.5" stroke-dasharray="3 5"><animateTransform attributeName="transform" type="rotate" from="0 {cx} {cy}" to="360 {cx} {cy}" dur="40s" repeatCount="indefinite"/></circle>']
    circ = f"M{cx},{cy-r} a{r},{r} 0 1,1 0,{2*r} a{r},{r} 0 1,1 0,{-2*r}"
    b.append(packets(circ, 2, 8, 6))
    b.append(flicker(T("THE", cx, cy - 6, 14, DIM, 700, anchor="middle") + T("LOOP", cx, cy + 20, 26, A, 800, anchor="middle")))
    for i, lab in enumerate(L["nodes"]):
        a = -math.pi / 2 + i * 2 * math.pi / n; nx, ny = cx + r * math.cos(a), cy + r * math.sin(a)
        bw = W(lab, 13, 700) + 24
        b.append(box(nx - bw / 2, ny - 15, bw, 30, lab, delay=i * 8 / n, period=8, size=13))
    for i, line in enumerate(L["story"]):
        if not line: continue
        yy = 104 + i * 32; big = i >= 3
        seg = T(line, 600, yy, 22 if big else 18, A if big else MID, 700 if big else 400)
        b.append(f'<g>{seg}<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;{i*0.1:.2f};{i*0.1+0.04:.2f};0.92;1" dur="12s" repeatCount="indefinite"/></g>')
    return card(w, h, "".join(b), "the loop: " + " to ".join(L["nodes"]).lower())

def evidence(D):
    E = CFG["evidence"]; w, h = 1200, 70 + 44 * len(E)
    b = [T("$ ls operations/", 32, 38, 14, DIM, 500)]
    for i, e in enumerate(E):
        yy = 84 + i * 44
        row = (f'<rect x="32" y="{yy-18}" width="{W(e["tag"],12,700)+16:.0f}" height="22" rx="3" fill="{A}"/>' + T(e["tag"], 40, yy - 2, 12, BG, 700)
               + T(e["name"], 150, yy, 20, A, 800) + T(e["line"], 520, yy, 15, MID, 400) + T(e["url"].replace("https://", ""), 1168, yy, 12, DIM, 400, anchor="end"))
        b.append(f'<g>{row}<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;{i*0.06:.2f};{i*0.06+0.02:.2f};0.94;1" dur="14s" repeatCount="indefinite"/></g>')
    return card(w, h, flicker("".join(b)), "evidence: " + ", ".join(e["name"].lower() for e in E))

def project(D):
    P = CFG["project"]; w, h = 1200, 330
    last = max(D["repos"], key=lambda r: r["pushedAt"]) if D["repos"] else {"name": "-", "description": ""}
    b = [flicker(T(f"PROJECT #{P['number']}", 32, 64, 44, A, 800))]
    b.append(f'<rect x="{32+W("PROJECT #"+P["number"],44,800)+16:.0f}" y="30" width="22" height="34" fill="{A}" filter="url(#gl)"><animate attributeName="opacity" values="1;0" calcMode="discrete" dur="0.9s" repeatCount="indefinite"/></rect>')
    rows = [("STATUS", "ACTIVE"), ("TYPE", P["type"]), ("OBJECTIVE", P["objective"]), ("CURRENTLY", f"{last['name']}"), ("NEXT", P["next"])]
    for i, (k, v) in enumerate(rows):
        yy = 118 + i * 34
        b.append(T(k, 32, yy, 13, DIM, 500) + T(v[:40], 170, yy, 16, A if k in ("STATUS", "NEXT") else MID, 700 if k in ("STATUS", "NEXT") else 500))
    b.append(f'<circle cx="{170+W("ACTIVE",16,700)+14:.0f}" cy="113" r="5" fill="{A}" filter="url(#gl)"><animate attributeName="opacity" values="1;0.15;1" dur="1.2s" repeatCount="indefinite"/></circle>')
    b.append(f'<rect x="32" y="290" width="560" height="10" rx="2" fill="{PANEL}" stroke="{DARK}"/><clipPath id="pb"><rect x="32" y="290" width="560" height="10"/></clipPath>'
             f'<g clip-path="url(#pb)"><rect y="290" width="140" height="10" fill="{A}" filter="url(#gl)"><animate attributeName="x" values="-140;592" dur="2.4s" repeatCount="indefinite"/></rect></g>')
    b.append(T("IN PROGRESS", 604, 300, 12, DIM, 700))
    b.append(f'<line x1="760" y1="40" x2="760" y2="300" stroke="{DARK}"/>')
    for i, line in enumerate(P["story"]):
        last_line = i == len(P["story"]) - 1
        seg = T(line, 790, 96 + i * 36, 20 if last_line else 16, A if last_line else MID, 800 if last_line else 400)
        b.append(f'<g>{seg}<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;{i*0.09:.2f};{i*0.09+0.03:.2f};0.93;1" dur="12s" repeatCount="indefinite"/></g>')
    return card(w, h, "".join(b), f"project {P['number']}: {P['objective']}")

def experiments(D):
    reps = sorted(D["repos"], key=lambda r: r.get("createdAt", r["pushedAt"]))
    idx = {r["name"]: i + 1 for i, r in enumerate(reps)}
    now = dt.datetime.now(dt.timezone.utc)
    def status(r):
        o = CFG.get("experiment_status", {}).get(r["name"])
        if o: return o
        if r.get("homepageUrl"): return "SHIPPED"
        age = (now - dt.datetime.fromisoformat(r["pushedAt"].replace("Z", "+00:00"))).days
        return "ACTIVE" if age <= 21 else "DORMANT"
    top = sorted(D["repos"], key=lambda r: r["pushedAt"], reverse=True)[:9]
    w, h = 1200, 70 + 34 * len(top)
    b = [T("ID", 32, 38, 12, DIM, 700) + T("EXPERIMENT", 150, 38, 12, DIM, 700) + T("NOTE", 560, 38, 12, DIM, 700) + T("STATUS", 1168, 38, 12, DIM, 700, anchor="end")]
    for i, r in enumerate(top):
        yy = 76 + i * 34; st = status(r); hot = st in ("ACTIVE", "SHIPPED")
        row = (T(f"E-{idx[r['name']]:03d}", 32, yy, 15, MID, 500) + T(r["name"][:26].upper(), 150, yy, 15, A, 700)
               + T((r.get("description") or "")[:44].lower(), 560, yy, 13, DIM, 400) + T(st, 1168, yy, 14, A if hot else DIM, 800 if hot else 500, anchor="end"))
        if st == "ACTIVE":
            row += f'<circle cx="{1168-W(st,14,800)-14:.0f}" cy="{yy-5}" r="4" fill="{A}" filter="url(#gl)"><animate attributeName="opacity" values="1;0.1;1" dur="1s" begin="{i*0.2:.1f}s" repeatCount="indefinite"/></circle>'
        b.append(f'<g>{row}<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;{i*0.05:.2f};{i*0.05+0.015:.3f};0.95;1" dur="16s" repeatCount="indefinite"/></g>')
    return card(w, h, flicker("".join(b)), "experiments")

def field_notes():
    N = CFG["field_notes"]; w, h = 1200, 200; per = 7; tot = per * len(N)
    b = []
    for i, n in enumerate(N):
        s0 = i / len(N); s1 = (i + 1) / len(N)
        g = T(f"FIELD NOTE / {n['n']}", 40, 50, 14, DIM, 700) + T(n["date"], 1160, 50, 12, DIM, 500, anchor="end")
        for j, line in enumerate(n["lines"]):
            g += T(line, 40, 104 + j * 42, 28 if j == len(n["lines"]) - 1 else 22, A if j == len(n["lines"]) - 1 else MID, 800 if j == len(n["lines"]) - 1 else 500)
        kt = f"0;{s0:.3f};{s0+0.02:.3f};{s1-0.02:.3f};{s1:.3f};1" if i else f"0;0.02;{s1-0.02:.3f};{s1:.3f};1"
        vals = "0;0;1;1;0;0" if i else "0;1;1;0;0"
        b.append(f'<g opacity="{0 if i else 1}">{g}<animate attributeName="opacity" keyTimes="{kt}" values="{vals}" dur="{tot}s" repeatCount="indefinite"/></g>')
    for i in range(len(N)):
        b.append(f'<rect x="{40+i*28}" y="176" width="20" height="4" fill="{DARK}"/><rect x="{40+i*28}" y="176" width="20" height="4" fill="{A}" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;{i/len(N):.3f};{i/len(N)+0.001:.3f};{(i+1)/len(N)-0.001:.3f};{(i+1)/len(N):.3f};1" dur="{tot}s" repeatCount="indefinite"/></rect>')
    return card(w, h, flicker("".join(b)), "field notes")

def activity(D):
    w, h = 1200, 250
    days = D["days"][-371:]; cur, best = streaks(D["days"])
    x0, y0, cs = 40, 76, 16
    nz = sorted(c for _, c in days if c) or [1]
    q = [nz[int(len(nz) * f)] for f in (0.25, 0.5, 0.75)]
    lv = lambda c: 0 if c == 0 else 1 + sum(c > t for t in q)
    shades = [PANEL, "#4a3300", "#8a6200", "#cc8f00", A]
    cells = []; first = dt.date.fromisoformat(days[0][0]); off = (first.weekday() + 1) % 7; ncols = 0
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
    return card(w, h, top + "".join(cells) + scan, "system heartbeat", beam)

def footer():
    ps = CFG["principles"]; w, h = 1200, 130
    b = []
    for i, (a, bb) in enumerate(ps):
        x = 32 + (i % 2) * 590; y = 48 + (i // 2) * 44
        b.append(T(a, x, y, 22, A, 800) + T(">", x + 250, y, 22, MID, 700) + T(bb, x + 290, y, 22, DIM, 500))
    b.append(T("open to conversations on call-centre automation, lead-gen infrastructure and AI in regulated financial services", 600, 120, 12, DIM, 400, anchor="middle"))
    return card(w, h, flicker("".join(b)), "principles")

# ---------------- run ----------------
SECTIONS = [("opmodel", "OPERATING_MODEL", "attention to cash"), ("loop", "THE_LOOP", "why an operator builds"),
            ("evidence", "EVIDENCE", "systems in production"), ("project", "PROJECT_#" , "current chapter"),
            ("experiments", "EXPERIMENTS", "this is a lab, not a showroom"), ("notes", "FIELD_NOTES", "observations from operating"),
            ("heartbeat", "SYSTEM_HEARTBEAT", "raw telemetry")]
def main():
    os.makedirs(OUT, exist_ok=True)
    for f in os.listdir(OUT):
        if f.endswith(".svg"): os.remove(os.path.join(OUT, f))
    D = fetch()
    files = {"header.svg": header(D), "opmodel.svg": opmodel(), "loop.svg": loop(), "evidence.svg": evidence(D), "project.svg": project(D),
             "experiments.svg": experiments(D), "notes.svg": field_notes(), "heartbeat.svg": activity(D), "footer.svg": footer()}
    for key, lab, sub in SECTIONS:
        files[f"h-{key}.svg"] = section(lab + (CFG["project"]["number"] if lab.endswith("#") else ""), sub)
    for n, s in files.items(): open(os.path.join(OUT, n), "w").write(s)
    json.dump({"updated": dt.datetime.now(dt.timezone.utc).replace(tzinfo=None).isoformat(timespec="minutes") + "Z"}, open(os.path.join(OUT, "manifest.json"), "w"))
    write_readme()

def write_readme():
    b = lambda l, logo, url: f'<a href="{url}"><img src="https://img.shields.io/badge/{l.replace(" ","%20")}-0b0805?style=for-the-badge&logo={logo}&logoColor=ffb000&labelColor=0b0805&color=0b0805" alt="{l}"></a>'
    sm = lambda l, url: f'<a href="{url}"><img src="https://img.shields.io/badge/{l.replace(" ","%20").replace("-","--")}-0b0805?style=flat-square&labelColor=0b0805&color=0b0805&logoColor=ffb000" alt="{l}"></a>'
    img = lambda f, alt: f'<img src="generated/{f}" width="100%" alt="{alt}">'
    parts = [img("header.svg", f"{CFG['name']}, revenue infrastructure engineer. {CFG['thesis']}"), "",
             " ".join([b("Email", "gmail", "mailto:franz@sigsolutions.co.za"), b("SIG Solutions", "googlechrome", "https://sigsolutions.co.za"),
                       b("LinkedIn", "linkedin", "https://linkedin.com/in/franzbadenhorst"), b("@FranzSalesSense", "x", "https://x.com/FranzSalesSense")]), ""]
    alts = {"opmodel": "operating model", "loop": "the loop", "evidence": "evidence", "project": f"project {CFG['project']['number']}",
            "experiments": "experiments", "notes": "field notes", "heartbeat": "system heartbeat"}
    for key, lab, sub in SECTIONS:
        parts += [img(f"h-{key}.svg", lab.lower()), img(f"{key}.svg", alts[key])]
        if key == "evidence":
            parts += ["", " ".join(sm(e["name"].title(), e["url"]) for e in CFG["evidence"])]
        parts.append("")
    parts.append(img("footer.svg", "principles"))
    md = '<div align="center">\n\n' + "\n".join(parts) + "\n\n</div>\n"
    open(os.path.join(ROOT, "README.md"), "w").write(md)

if __name__ == "__main__":
    main()
