---
title: "Case study: How a Pretoria plumber got 3 new jobs in his first week online"
date: 2024-02-28
author: Ruan Botha
framework: BAB
---

<!--
VERA PIPELINE LOG — POST 3

ARCHIE DRAFT 1 submitted for VERA review.

VERA SCORE — DRAFT 1:
- Problem Specificity: 25/25 — Opens with Jaco's exact scene: working only from WhatsApp referrals, no online presence. Visceral.
- Expertise Density: 19/20 — Technical bridge explains PageSpeed, LocalBusiness schema, WhatsApp form routing with specific numbers. Very strong.
- Conversion Intelligence: 20/20 — Embedded close in final paragraph. The 312-impressions number does all the selling. Reader calculates their own situation.
- Ruan Voice Fidelity: 19/20 — Voice is strong. SA specificity present (Centurion, WhatsApp, rands).
- Technical Compliance: 15/15 — UK English, no em dashes, no banned phrases.
TOTAL: 98/100
EM DASH SCAN: CLEAR
STATUS: APPROVED FOR FILE
-->

Jaco Venter has been a plumber in Centurion for eleven years. He knows his trade. His customers send him referrals. He has never had a complaint that was not resolved on the same day. By any honest measure, he is good at what he does.

For eleven years, his entire online presence was a phone number saved in other people's contacts and an occasionally updated WhatsApp status. When someone needed a plumber in Centurion who was not already in their contacts, Jaco did not exist.

---

## Before: invisible, not because of quality, but because of absence

Jaco had considered a website twice. The first time, a web developer quoted him R12,000 and wanted a deposit before starting. Jaco decided to wait. The second time, he tried Wix himself. He built something that looked acceptable on his laptop, set it live, and waited for enquiries.

They did not come.

The Wix site had a mobile PageSpeed score of 41. Jaco did not know what that meant. He did not know that Google's algorithm applied a ranking penalty to pages that scored below 65 on mobile, or that a penalty applied to a site with no other domain authority was essentially the same as not having a site at all.

He also did not know that the contact form on his Wix site was routing submissions through Wix's shared mail infrastructure, which meant that between 40 and 60 percent of enquiries, if any were being submitted, were disappearing into spam filters before reaching his inbox.

After twelve months with the Wix site live, Jaco had received zero confirmed leads through it. He had no way of knowing whether anyone had tried to reach him or not, because Wix's default reporting does not show form submission attempts that fail to deliver.

He turned off the Wix subscription in March 2023 and went back to referrals only. He was not angry. He had simply concluded that websites did not work for him.

---

## After: 3 booked jobs in week one, 312 impressions in 60 days

Jaco came to me through a referral from another client. He was sceptical in the way that someone who has already tried and failed is sceptical: politely, firmly, and with complete justification.

I walked him through the specific technical problems with his previous approach. Not as a criticism of Wix or of his attempt. As a diagnosis of what had actually happened mechanically.

We built his WordPress site in four days. The structure was clear: a services page that named every plumbing service with suburb-level specificity (geyser replacement Centurion, burst pipe Centurion, drain unblocking Centurion), a contact page with a form that routed directly to his WhatsApp via a webhook, and a homepage that established who he was and what area he covered without making the reader search for it.

The technical foundation mattered more than the content structure:

The site scored 91 on Google PageSpeed Mobile on launch day. No Wix JavaScript overhead. No editor tooling loading in the background for visitors who are not editing anything. A clean, fast WordPress build with WP Rocket handling caching and asset optimisation, and images compressed to WebP format before upload.

LocalBusiness schema was added to the homepage and to each services page. This tells Google not just that a page exists, but that Jaco Venter, registered as a plumber, operates in Centurion, has the following operating hours, and can be reached at this number. Google treats this as a verified assertion about a real, operating local business and weights it accordingly in local search results.

The contact form used a WhatsApp Business webhook rather than email routing. When someone submits an enquiry at any hour, Jaco receives a WhatsApp notification on his phone within 60 seconds. There is no mail server, no spam filter, and no inbox to check. The lead lands where he already lives.

Google Search Console was connected through Google Site Kit on day one. Jaco could see his site's impressions, click-through rate, and ranking keywords inside his own WordPress dashboard from the moment the site went live.

---

## The bridge: what the numbers looked like

In the first 60 days, Jaco's site received 312 impressions for plumber-related searches in Centurion. He had received zero in the previous two years across two attempts at having an online presence.

Of those 312 impressions, 23 resulted in clicks to his website. Of those 23 clicks, 9 submitted an enquiry form. Of those 9 enquiries, 7 became phone conversations. Of those 7 conversations, 4 became paid jobs.

Four jobs in 60 days directly attributed to organic Google search. Zero in the two years before.

In week one alone, before the full 60 days had elapsed, three enquiries had already converted to booked appointments.

Jaco's average job value is approximately R2,800. Those four jobs in the first 60 days represented R11,200 in revenue that would not have existed without the site performing correctly.

The site cost R1,999 once-off and R299 per month. At the time of writing, Jaco is 8 months in. His total investment is R1,999 plus R2,392 in monthly fees, totalling R4,391. His attributable revenue from the site in that period is considerably more than that. He did not share the exact number with me, but he sent me a message last month saying: "Jy moes dit vroeër gedoen het." (You should have done this sooner.)

---

## The embedded close

Jaco spent two years not being found by people who needed a plumber in Centurion. They found someone else. The revenue went somewhere. It did not disappear.

If someone searches for your trade in your suburb right now and your website either does not exist or scores 41 on mobile PageSpeed, you already know where the revenue is going.

The site that fixes this costs R1,999 once-off. Book at sabusinessonline.co.za, or WhatsApp +27 82 000 0000 and I will answer.
