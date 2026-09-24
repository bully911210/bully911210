<div align="center">

<img src="./header.svg" alt="Franz Badenhorst, revenue infrastructure engineer, Pretoria, South Africa. Meta ads to CRM to ViciDial to closed sale." width="100%">

[![Email](https://img.shields.io/badge/Email-0d1117?style=for-the-badge&logo=gmail&logoColor=4AD0C0)](mailto:franz@sigsolutions.co.za)
[![SIG Solutions](https://img.shields.io/badge/SIG%20Solutions-0d1117?style=for-the-badge&logo=googlechrome&logoColor=4AD0C0)](https://sigsolutions.co.za)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0d1117?style=for-the-badge&logo=linkedin&logoColor=4AD0C0)](https://linkedin.com/in/franzbadenhorst)
[![@FranzSalesSense](https://img.shields.io/badge/@FranzSalesSense-0d1117?style=for-the-badge&logo=x&logoColor=4AD0C0)](https://x.com/FranzSalesSense)

</div>

---

I build the systems between ad spend and a closed sale: lead capture, contact warehousing, dialler logic and AI qualification, run across a 50+ seat call centre and the businesses it sells for. One number decides whether any of it stays: **cost per closed sale**.

```ts
const franz = {
  base:       "Pretoria, South Africa",
  role:       "COO/CSO and equity partner across a South African portfolio",
  builds:     "revenue infrastructure",
  removes:    "humans copying numbers between systems",
  measuredBy: "cost per closed sale",
};
```

## The pipeline I build

```
 ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
 │   META ADS   │   │   CONTACT    │   │   VICIDIAL   │   │  AGENT + AI  │
 │ instant form │──▶│  warehouse   │──▶│  campaign +  │──▶│qualification │──▶  CLOSED SALE
 │    + CAPI    │   │dedup · POPIA │   │  list logic  │   │  + routing   │
 └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
         ▲                                                                          │
         └─────────────────── cost per closed sale feeds bidding ───────────────────┘
```

> [!NOTE]
> Every box above replaced a spreadsheet, a WhatsApp group or a person copying numbers between two systems.

## Systems I ship

```
Lead acquisition     Meta Ads pipelines, instant form routing, CAPI integrations,
                     petition funnels, audience compounding, cost-per-sale tracking

Dialler systems      ViciDial campaign builds, dialler-safe exports, duplicate
                     suppression, revenue-per-list analytics, contact lifecycle

Data infrastructure  Supabase and Postgres warehouses, batch validation, cross-entity
                     dedup, SA telecom normalisation, campaign reconciliation

AI workflows         Autonomous ad creative pipelines, voice qualification agents,
                     agent-orchestrated routing, LLM-assisted compliance gating
```

## Stack

<table>
<tr>
<td valign="top" width="33%">

**Build**

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

</td>
<td valign="top" width="33%">

**Run**

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=black)
![ViciDial](https://img.shields.io/badge/ViciDial-222222?style=flat-square&logo=asterisk&logoColor=white)
![FreePBX](https://img.shields.io/badge/FreePBX-C42D2D?style=flat-square&logo=asterisk&logoColor=white)
![FFmpeg](https://img.shields.io/badge/FFmpeg-007808?style=flat-square&logo=ffmpeg&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white)

</td>
<td valign="top" width="33%">

**Sell**

![Meta Ads](https://img.shields.io/badge/Meta%20Ads-0866FF?style=flat-square&logo=meta&logoColor=white)
![GoHighLevel](https://img.shields.io/badge/GoHighLevel-FF6B00?style=flat-square)
![n8n](https://img.shields.io/badge/n8n-EA4B71?style=flat-square&logo=n8n&logoColor=white)
![Make](https://img.shields.io/badge/Make-6C63FF?style=flat-square&logo=make&logoColor=white)
![Claude](https://img.shields.io/badge/Claude-D97757?style=flat-square&logo=anthropic&logoColor=white)
![ElevenLabs](https://img.shields.io/badge/ElevenLabs-000000?style=flat-square&logo=elevenlabs&logoColor=white)

</td>
</tr>
</table>

## Current projects

| | Project | What it is |
|---|---|---|
| ☎️ | **[SIG Solutions](https://sigsolutions.co.za)** | 50+ seat outbound BPO with owned dialler infrastructure and AI voice routing |
| 🛡 | **[Acorn Brokers](https://acornbrokers.co.za)** | Authorised FSP distributing legal protection products to licensed SA firearm owners |
| 🏛 | **[Civil Society South Africa](https://civilsocietysouthafrica.co.za)** | Civic advocacy NGO running broad-mandate campaigns on minority-impacting issues |
| 📈 | **[Stacked Marketing](https://stackedmarketing.co.za)** | AI-enabled performance marketing agency |
| 📝 | **[LicenceReady](https://licenceready.co.za)** | Firearm motivation letter generator with localised crime data and guided next steps |

<details>
<summary><b>How I decide what to build</b></summary>

<br>

If a task repeats more than weekly, has a defined input and a defined output, and a mistake costs money, it gets built. If it needs judgement that changes with context, it stays with a human and gets better tooling instead.

The measure is never impressions, engagement or raw lead count. It is cost per closed sale, because that is the only number that survives contact with a P&L.

</details>

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
