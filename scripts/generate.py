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
def fmt_date(iso):
    d = dt.datetime.fromisoformat(iso.replace("Z", "+00:00"))
    return d.strftime("%d %b %Y / %H:%M").upper()

def header(D):
    w, h = 1200, 360
    live = [r for r in D["repos"] if r.get("homepageUrl")]
    counters = [("CONTRIBUTIONS", D["alltime"]), ("REPOSITORIES", D["repo_count"]), ("LIVE BUILDS", len(live))]
    if CFG.get("users"): counters.append((CFG.get("users_label", "USERS"), int(CFG["users"])))
    ticker = "  >>  ".join(CFG["ticker"]) + "  >>  "
    b = [f'<rect width="{w}" height="34" fill="#140e04"/>', flicker(marquee(ticker, 23, 14, A, 14))]
    b.append(flicker(T(CFG["name"].upper(), 56, 124, 56, A, 800) + T(CFG["tagline"], 58, 160, 16, MID, 400)))
    b.append(cursor(58 + W(CFG["tagline"], 16, 400) + 6, 160, 18, 10))
    x = 58; n = len(counters); gap = 200 if n <= 3 else 170; size = 36 if n <= 3 else 30
    for i, (lab, val) in enumerate(counters):
        b.append(T(lab, x, 236, 12, DIM, 500))
        od, wd = odometer(val, x, 284, size, delay=i * 0.35)
        b.append(flicker(od)); x += max(gap, wd + 40)
    # status panel (replaces radar)
    px, py = 800, 64
    b.append(f'<rect x="{px}" y="{py}" width="352" height="232" rx="6" fill="{PANEL}" stroke="{DARK}"/>')
    last_push = max((r["pushedAt"] for r in D["repos"]), default=None)
    week = sum(c for _, c in D["days"][-7:])
    rows = [("MODE", CFG.get("mode", "BUILD")), ("BASE", CFG.get("base", "")), ("PROJECT", "#" + CFG["project"]["number"]),
            ("LAST PUSH", fmt_date(last_push) if last_push else "-"), ("LAST 7 DAYS", f"{week} contributions")]
    for i, (k, v) in enumerate(rows):
        y = py + 40 + i * 40
        b.append(T(k, px + 22, y, 12, DIM, 500))
        b.append(flicker(T(v, px + 132, y, 15, A, 700), 3 + i * 0.3))
        if k == "PROJECT":
            b.append(f'<circle cx="{px+132+W(v,15,700)+14:.0f}" cy="{y-5}" r="5" fill="{A}" filter="url(#gl)"><animate attributeName="opacity" values="1;0.15;1" dur="1.2s" repeatCount="indefinite"/></circle>')
    b.append(f'<rect x="{px}" y="{py}" width="352" height="3" fill="{A}" opacity="0.6"><animate attributeName="y" values="{py};{py+229};{py}" dur="5s" repeatCount="indefinite"/></rect>')
    return card(w, h, "".join(b), f"{CFG['name']}, revenue infrastructure engineer, Pretoria, South Africa", border=False, roll=5)

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


def system_map():
    M = CFG["system_map"]; w, h = 1200, 420; bw, bh = 176, 46
    top = M["top"]; st = (1200 - 100 - bw) / (len(top) - 1); xs = [40 + i * st for i in range(len(top))]; yt = 70
    br = M["branch"]; bx = xs[-1]; yb = [220, 300]
    bot = M["bottom"]; bxs = [bx - st * (i + 1) for i in range(len(bot))]; yB = 260
    C = lambda x, y: (x + bw / 2, y + bh / 2)
    nodes = [(x, yt, t, False) for x, t in zip(xs, top)] + [(bx, y, t, False) for y, t in zip(yb, br)] + [(x, yB, t, i == 0) for i, (x, t) in enumerate(zip(bxs, bot))]
    e = []
    def edge(d, rev=False):
        e.append(f'<path d="{d}" fill="none" stroke="{DIM}" stroke-width="1.5" stroke-dasharray="3 5"><animate attributeName="stroke-dashoffset" values="0;{16 if rev else -16}" dur="0.6s" repeatCount="indefinite"/></path>')
    for i in range(len(top) - 1):
        a, b_ = C(xs[i], yt), C(xs[i + 1], yt); edge(f"M{a[0]+bw/2},{a[1]} H{b_[0]-bw/2}")
    dcx, dcy = C(bx, yt)
    ai, hu = C(bx, yb[0]), C(bx, yb[1])
    edge(f"M{dcx},{dcy+bh/2} V{ai[1]-bh/2}")
    edge(f"M{dcx+bw/2},{dcy} h18 V{hu[1]} h-18")
    s0 = C(bxs[0], yB)
    edge(f"M{ai[0]-bw/2},{ai[1]} h-30 V{s0[1]} H{s0[0]+bw/2}"); edge(f"M{hu[0]-bw/2},{hu[1]} h-30 V{s0[1]}")
    for i in range(len(bot) - 1):
        a, b_ = C(bxs[i], yB), C(bxs[i + 1], yB); edge(f"M{a[0]-bw/2},{a[1]} H{b_[0]+bw/2}")
    dl = C(bxs[-1], yB); at = C(xs[0], yt)
    fb = f"M{dl[0]-bw/2},{dl[1]} H{at[0]} V{at[1]+bh/2}"
    e.append(f'<path d="{fb}" fill="none" stroke="{A}" stroke-opacity="0.55" stroke-width="2" stroke-dasharray="6 6"><animate attributeName="stroke-dashoffset" values="0;-24" dur="0.8s" repeatCount="indefinite"/></path>')
    e.append(T(M["feedback"], at[0] + 16, 360, 13, DIM, 400))
    # packets along full loop, via AI and via HUMAN
    def route(via):
        pts = [C(x, yt) for x in xs] + [via]
        p = f"M{pts[0][0]},{pts[0][1]} " + " ".join(f"L{x},{y}" for x, y in pts[1:])
        p += f" L{via[0]-bw/2-30},{via[1]} L{via[0]-bw/2-30},{s0[1]} " + " ".join(f"L{C(x,yB)[0]},{yB+bh/2}" for x in bxs)
        p += f" L{at[0]},{dl[1]} L{at[0]},{at[1]}"
        return p
    pk = []
    for k, via in enumerate([ai, hu, ai]):
        pk.append(f'<circle r="6" fill="{A}" filter="url(#gl)"><animateMotion path="{route(via)}" dur="9s" begin="{k*3}s" repeatCount="indefinite"/></circle>')
    nd = []
    for i, (x, y, t, hot) in enumerate(nodes):
        fill = A if t == "SALE" else BG
        nd.append(f'<rect x="{x}" y="{y}" width="{bw}" height="{bh}" rx="4" fill="{fill}" stroke="{A}" stroke-opacity="0.5"><animate attributeName="stroke-opacity" values="0.35;1;0.35" dur="3s" begin="{i*0.3:.1f}s" repeatCount="indefinite"/></rect>')
        nd.append(T(t, x + bw / 2, y + 29, 15, BG if t == "SALE" else A, 700, anchor="middle"))
    return card(w, h, "".join(e) + "".join(pk) + flicker("".join(nd)), "system map: " + " to ".join(top + bot).lower())

def project(D):
    P = CFG["project"]; w, h = 1200, 300
    b = [flicker(T(f"PROJECT #{P['number']}", 40, 70, 44, A, 800))]
    rows = [("STATUS", P.get("status") or "ACTIVE"), ("TYPE", P.get("type") or ""), ("OBJECTIVE", P.get("objective")), ("PHASE", P.get("phase") or "IN PROGRESS")]
    for i, (k, v) in enumerate(rows):
        y = 122 + i * 34
        b.append(T(k, 42, y, 13, DIM, 500))
        if v is None:
            b.append(f'<rect x="190" y="{y-15}" width="230" height="20" fill="{A}" opacity="0.9"><animate attributeName="opacity" values="0.9;0.55;0.9" dur="2s" repeatCount="indefinite"/></rect>' + T("REDACTED", 196, y, 12, BG, 700))
        else:
            b.append(T(v, 190, y, 16, A, 700))
    b.append(f'<circle cx="{190+W(rows[0][1],16,700)+14:.0f}" cy="117" r="5" fill="{A}" filter="url(#gl)"><animate attributeName="opacity" values="1;0.15;1" dur="1.2s" repeatCount="indefinite"/></circle>')
    y = 262; b.append(f'<rect x="42" y="{y-12}" width="460" height="14" fill="{PANEL}" stroke="{DARK}"/>')
    if P.get("progress") is not None:
        pw = 460 * float(P["progress"]) / 100
        b.append(f'<rect x="42" y="{y-12}" width="0" height="14" fill="{A}" filter="url(#gl)"><animate attributeName="width" values="0;{pw:.0f};{pw:.0f}" keyTimes="0;0.3;1" dur="6s" repeatCount="indefinite"/></rect>' + T(f"{P['progress']}%", 516, y, 13, A, 700))
    else:
        b.append(f'<rect x="42" y="{y-12}" width="90" height="14" fill="{A}" filter="url(#gl)"><animate attributeName="x" values="42;412;42" dur="3s" repeatCount="indefinite"/></rect>' + T("BUILDING", 516, y, 13, A, 700))
    # narrative, typed in sequence
    story = P.get("story", []); extra = []
    if P.get("now"): extra.append(("NOW", P["now"]))
    if P.get("next"): extra.append(("NEXT", P["next"]))
    lines = story + [f"{k}: {v}" for k, v in extra]
    N = len(lines); cyc = 2 + N * 1.4 + 4
    b.append(f'<line x1="640" y1="40" x2="640" y2="270" stroke="{DARK}"/>')
    for i, ln in enumerate(lines):
        yy = 80 + i * 40; t0 = (1 + i * 1.4) / cyc
        b.append(f'<g opacity="0">{T(ln, 680, yy, 17, A if ln.startswith("#") else MID, 700 if ln.startswith("#") else 400)}<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;{t0:.3f};{t0+0.02:.3f};0.95;1" dur="{cyc:.1f}s" repeatCount="indefinite"/></g>')
    return card(w, h, "".join(b), f"project {P['number']}")

def experiments(D):
    repos = D["repos"][:10]; w, h = 1200, 70 + 30 * len(repos)
    now = dt.datetime.now(dt.timezone.utc); total = D["repo_count"]
    b = [T("ID", 40, 40, 12, DIM, 500), T("EXPERIMENT", 140, 40, 12, DIM, 500), T("NOTE", 520, 40, 12, DIM, 500), T("STATUS", 1060, 40, 12, DIM, 500)]
    cyc = 2 + len(repos) * 0.5 + 6
    for i, r in enumerate(repos):
        y = 76 + i * 30
        age = (now - dt.datetime.fromisoformat(r["pushedAt"].replace("Z", "+00:00"))).days
        st = "SHIPPED" if r.get("homepageUrl") else ("ACTIVE" if age <= 14 else "PARKED")
        col = A if st != "PARKED" else DIM
        line = (T(f"E-{total - i:03d}", 40, y, 14, DIM, 500) + T(r["name"].upper()[:28], 140, y, 15, A, 700) +
                T((r.get("description") or "-")[:52].lower(), 520, y, 14, MID, 400) + T(st, 1060, y, 14, col, 700))
        t0 = (1 + i * 0.5) / cyc
        b.append(f'<g opacity="0">{line}<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;{t0:.3f};{t0+0.01:.3f};0.96;1" dur="{cyc:.1f}s" repeatCount="indefinite"/></g>')
        if st == "ACTIVE":
            b.append(f'<circle cx="1146" cy="{y-5}" r="4" fill="{A}" filter="url(#gl)"><animate attributeName="opacity" values="1;0.1;1" dur="1s" repeatCount="indefinite"/></circle>')
    return card(w, h, flicker("".join(b)), "experiments log")

def field_notes():
    notes = CFG["field_notes"]; w, h = 1200, 190; per = 6; cyc = per * len(notes)
    b = []
    for i, nte in enumerate(notes):
        g = T(f"FIELD NOTE / {nte['n']}", 40, 44, 13, DIM, 600) + T(nte["date"], 1160, 44, 13, DIM, 500, anchor="end")
        g += "".join(T(t, 40, 96 + j * 40, 26, A, 700) for j, t in enumerate(nte["text"]))
        s0 = i / len(notes); s1 = (i + 1) / len(notes); f = 0.4 / cyc
        kt = f"0;{s0:.4f};{s0+f:.4f};{s1-f:.4f};{s1:.4f};1" if i else f"0;{f:.4f};{s1-f:.4f};{s1:.4f};1"
        vals = "0;0;1;1;0;0" if i else "0;1;1;0;0"
        b.append(f'<g opacity="0">{g}<animate attributeName="opacity" keyTimes="{kt}" values="{vals}" dur="{cyc}s" repeatCount="indefinite"/></g>')
    for i in range(len(notes)):
        b.append(f'<rect x="{40+i*28}" y="170" width="20" height="4" fill="{DARK}"/><rect x="{40+i*28}" y="170" width="20" height="4" fill="{A}" opacity="0"><animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;{i/len(notes)+0.0001:.4f};{(i+1)/len(notes)-0.0001:.4f};{(i+1)/len(notes):.4f};1" calcMode="discrete" dur="{cyc}s" repeatCount="indefinite"/></rect>')
    return card(w, h, flicker("".join(b)), "field notes")

def footer():
    L = CFG["operator_loop"]; w, h = 1200, 150
    widths = [W(t, 17, 700) for t in L]; arrow = 44; total = sum(widths) + arrow * (len(L) - 1)
    x = (w - total) / 2; b = []; n = len(L)
    for i, t in enumerate(L):
        b.append(T(t, x, 62, 17, DIM, 700))
        b.append(f'<g opacity="0">{T(t, x, 62, 17, A, 800)}<animate attributeName="opacity" values="0;1;0;0" keyTimes="0;0.05;{1/n:.3f};1" dur="{n*0.9:.1f}s" begin="{i*0.9:.1f}s" repeatCount="indefinite"/></g>')
        x += widths[i]
        if i < n - 1: b.append(T("->", x + 10, 62, 17, DARK, 700)); x += arrow
    ps = CFG["principles"]
    b.append(T("   /   ".join(f"{a.lower()} > {c.lower()}" for a, c in ps), 600, 112, 13, DIM, 500, anchor="middle"))
    return card(w, h, "".join(b), "operator loop")

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


# ---------------- run ----------------
def main():
    os.makedirs(OUT, exist_ok=True)
    D = fetch()
    files = {"header.svg": header(D), "system-map.svg": system_map(), "project.svg": project(D), "experiments.svg": experiments(D),
             "field-notes.svg": field_notes(), "activity.svg": activity(D), "footer.svg": footer()}
    for s in ["THE_LOOP", "PROOF", f"PROJECT_{CFG['project']['number']}", "EXPERIMENTS", "FIELD_NOTES", "HEARTBEAT"]:
        files[f"h-{s.lower()}.svg"] = section(s)
    ven = list(CFG["ventures"])
    if len(ven) % 2 and CFG.get("filler"): ven.append(CFG["filler"])
    for i, v in enumerate(ven):
        files[f"venture-{i}.svg"] = tile(v["name"], v["line"], v["tag"], v["url"].replace("https://", ""), i)
    keep = set(files) | {"manifest.json"}
    for f in os.listdir(OUT):
        if f not in keep: os.remove(os.path.join(OUT, f))
    for n, s in files.items(): open(os.path.join(OUT, n), "w").write(s)
    json.dump({"updated": dt.datetime.now(dt.timezone.utc).replace(tzinfo=None).isoformat(timespec="minutes") + "Z"}, open(os.path.join(OUT, "manifest.json"), "w"))
    write_readme(ven)

def write_readme(vens):
    def pair(items):
        rows = []
        for i in range(0, len(items), 2):
            cells = "".join(f'<td width="50%"><a href="{u}"><img src="{src}" width="100%" alt="{alt}"></a></td>' for src, u, alt in items[i:i+2])
            rows.append(f"<tr>{cells}</tr>")
        return "<table>" + "".join(rows) + "</table>"
    b = lambda l, logo, url: f'<a href="{url}"><img src="https://img.shields.io/badge/{l.replace(" ","%20")}-0b0805?style=for-the-badge&logo={logo}&logoColor=ffb000&labelColor=0b0805&color=0b0805" alt="{l}"></a>'
    img = lambda f, alt: f'<img src="generated/{f}" width="100%" alt="{alt}">'
    pn = CFG["project"]["number"]
    ven = pair([(f"generated/venture-{i}.svg", v["url"], v["name"]) for i, v in enumerate(vens)])
    md = f"""<div align="center">

{img("header.svg", CFG['name'] + ", revenue infrastructure engineer. Systems between attention and cash.")}

{b("Email","gmail","mailto:franz@sigsolutions.co.za")} {b("SIG Solutions","googlechrome","https://sigsolutions.co.za")} {b("LinkedIn","linkedin","https://linkedin.com/in/franzbadenhorst")} {b("@FranzSalesSense","x","https://x.com/FranzSalesSense")}

{img("h-the_loop.svg", "the loop")}
{img("system-map.svg", "Attention to Meta ads to lead to CRM to dialler to AI or human to sale to collection to data, feeding back to attention")}

{img("h-proof.svg", "proof")}

{ven}

{img(f"h-project_{pn}.svg", "project " + pn)}
{img("project.svg", "project " + pn)}

{img("h-experiments.svg", "experiments")}
<a href="https://github.com/{CFG['login']}?tab=repositories">{img("experiments.svg", "experiments log")}</a>

{img("h-field_notes.svg", "field notes")}
{img("field-notes.svg", "field notes")}

{img("h-heartbeat.svg", "heartbeat")}
{img("activity.svg", "contribution heartbeat")}

{img("footer.svg", "operate, bottleneck, build, automate, operate")}

</div>
"""
    open(os.path.join(ROOT, "README.md"), "w").write(md)

if __name__ == "__main__":
    main()
