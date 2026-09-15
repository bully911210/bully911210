<div align="center">

<img src="./assets/header.svg" alt="Franz Badenhorst, revenue infrastructure engineer, Pretoria, South Africa" width="100%">

<a href="https://github.com/DenverCoder1/readme-typing-svg"><img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=22&duration=3000&pause=1000&color=4AD0C0&center=true&vCenter=true&width=700&lines=Dialers+%E2%80%A2+Lead+Engines+%E2%80%A2+AI+Workflows;Meta+Ads+%E2%86%92+CRM+%E2%86%92+ViciDial+%E2%86%92+Closed+Sale;Own+the+stack%2C+not+the+subscription" alt="Dialers, lead engines, AI workflows" /></a>

[![Email](https://img.shields.io/badge/Email-0d1117?style=for-the-badge&logo=gmail&logoColor=4AD0C0)](mailto:franz@sigsolutions.co.za)
[![SIG Solutions](https://img.shields.io/badge/SIG%20Solutions-0d1117?style=for-the-badge&logo=googlechrome&logoColor=4AD0C0)](https://sigsolutions.co.za)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0d1117?style=for-the-badge&logo=linkedin&logoColor=4AD0C0)](https://linkedin.com/in/your-handle)

</div>

---

```ts
const franz = {
  location: "Pretoria, South Africa",
  focus:    "Revenue infrastructure: the systems between ad spend and closed sales",
  stack:    ["TypeScript", "React", "Next.js", "Node.js", "Python", "PostgreSQL", "Supabase"],
  infra:    ["ViciDial", "FreePBX", "FFmpeg", "Playwright", "GoHighLevel"],
  ai:       ["Claude", "ElevenLabs", "n8n", "Make"],
  metric:   "cost per closed sale",
};
```

## The pipeline I build

```mermaid
flowchart LR
  A["Meta Ads<br/>instant forms"] --> B["CAPI + webhook<br/>routing"]
  B --> C["Contact warehouse<br/>dedup, validation, POPIA"]
  C --> D["ViciDial<br/>campaign + list logic"]
  D --> E["Agent desktop<br/>AI qualification"]
  E --> F["Closed sale"]
  F -. "cost per sale<br/>feeds bidding" .-> A

  classDef node fill:#121a22,stroke:#2b3b48,color:#e8eef5;
  classDef win fill:#4ad0c0,stroke:#4ad0c0,color:#0b0f14;
  class A,B,C,D,E node;
  class F win;
```

> [!NOTE]
> Everything below exists because a spreadsheet, a WhatsApp group or a person copying numbers between two systems used to sit where the code now sits.

## Stack

<table>
<tr>
<td valign="top" width="33%">

**Build**

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=flat-square)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black&style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white&style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white&style=flat-square)
![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white&style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)

</td>
<td valign="top" width="33%">

**Run**

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql&logoColor=white&style=flat-square)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=black&style=flat-square)
![ViciDial](https://img.shields.io/badge/ViciDial-222222?logo=asterisk&logoColor=white&style=flat-square)
![FreePBX](https://img.shields.io/badge/FreePBX-C42D2D?logo=asterisk&logoColor=white&style=flat-square)
![FFmpeg](https://img.shields.io/badge/FFmpeg-007808?logo=ffmpeg&logoColor=white&style=flat-square)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?logo=playwright&logoColor=white&style=flat-square)

</td>
<td valign="top" width="33%">

**Sell**

![Meta Ads](https://img.shields.io/badge/Meta%20Ads-0866FF?logo=meta&logoColor=white&style=flat-square)
![GoHighLevel](https://img.shields.io/badge/GoHighLevel-FF6B00?logoColor=white&style=flat-square)
![n8n](https://img.shields.io/badge/n8n-EA4B71?logo=n8n&logoColor=white&style=flat-square)
![Make](https://img.shields.io/badge/Make-6C63FF?logo=make&logoColor=white&style=flat-square)
![Claude](https://img.shields.io/badge/Claude-D97757?logo=anthropic&logoColor=white&style=flat-square)
![ElevenLabs](https://img.shields.io/badge/ElevenLabs-000000?logoColor=white&style=flat-square)

</td>
</tr>
</table>

## Current projects

| | Project | What it is |
|---|---|---|
| 🛡 | **[Acorn Brokers](https://acornbrokers.co.za)** | Legal liability acquisition engine for SA firearm owners |
| ☎️ | **[SIG Solutions](https://sigsolutions.co.za)** | BPO call centre with dialler infrastructure and AI voice routing |
| 🏛 | **[Civil Society South Africa](https://civilsocietysouthafrica.co.za)** | Civic advocacy NGO running broad-mandate campaigns on minority-impacting issues |
| 📈 | **[Stacked Marketing](https://stackedmarketing.co.za)** | AI-enabled performance marketing agency |
| 📝 | **[LicenceReady](https://licenceready.co.za)** | Firearm motivation letter generator with localised crime data and guided next steps |

## Systems I ship

```
Lead acquisition     Meta Ads pipelines, instant form routing, CAPI integrations,
                     petition funnels, audience compounding, cost-per-sale tracking

Dialler systems      ViciDial campaign builds, dialler-safe exports, duplicate
                     suppression, revenue-per-list analytics, contact lifecycle mgmt

Data infrastructure  Supabase and Postgres warehouses, batch validation, cross-entity
                     dedup, SA telecom normalisation, campaign reconciliation

AI workflows         Autonomous ad creative pipelines, voice qualification agents,
                     agent-orchestrated routing, LLM-assisted compliance gating
```

<details>
<summary><b>How I decide what to build</b></summary>

<br>

Every system above replaced a person doing the same thing by hand, badly, at scale. The test is simple: if a task is repeated more than weekly, has a defined input and a defined output, and a mistake costs money, it gets built. If it needs judgement that changes with context, it stays with a human and gets better tooling instead.

The measure is never engagement, impressions or leads. It is cost per closed sale, because that is the only number that survives contact with a P&L.

</details>

## Activity

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./dist/github-snake-dark.svg" />
  <source media="(prefers-color-scheme: light)" srcset="./dist/github-snake.svg" />
  <img alt="Contribution graph as a snake game" src="./dist/github-snake.svg" />
</picture>

<br><br>

<img src="https://github-readme-stats.vercel.app/api?username=YOUR_USERNAME&show_icons=true&hide_border=true&bg_color=0d1117&title_color=4AD0C0&icon_color=4AD0C0&text_color=8b97a4&hide=contribs" alt="GitHub stats" height="165">
<img src="https://github-readme-stats.vercel.app/api/top-langs/?username=YOUR_USERNAME&layout=compact&hide_border=true&bg_color=0d1117&title_color=4AD0C0&text_color=8b97a4" alt="Top languages" height="165">

</div>

---

```
Infrastructure > aesthetics
Control        > dependency
Ownership      > outsourcing
Systems        > hacks
```

<div align="center">
<sub>Open to conversations about call-centre automation, lead-gen infrastructure and AI in regulated financial services.</sub>
</div>
