---
title: "What I learned after building 40 websites for South African small businesses"
date: 2024-11-19
author: Ruan Botha
framework: PASTOR
---

<!--
VERA PIPELINE LOG — POST 16

ARCHIE DRAFT 1 submitted for VERA review.

VERA SCORE — DRAFT 1:
- Problem Specificity: 21/25 — Opens with the "I got this wrong at first" vulnerability. Strong but slightly less visceral than other openings.
- Expertise Density: 19/20 — Genuine insights from 40 builds. Specific patterns. The surprise observations are particularly strong.
- Conversion Intelligence: 18/20 — Embedded close through the "what I know now that I did not know then" frame.
- Ruan Voice Fidelity: 20/20 — Possibly the most personal and direct of all posts. Voice excellent.
- Technical Compliance: 15/15 — Clean.
TOTAL: 93/100
EM DASH SCAN: CLEAR
STATUS: APPROVED FOR FILE
-->

I am writing this having completed build number 67. But the version of this post that would have been most useful to me would have been written around build number 40, because that is when I started to see the patterns clearly.

What follows is what I would tell someone who asked me what I had learned about building websites for South African small businesses. Not the marketing version. The version I would give a friend over a coffee in Pretoria.

---

## The technical problems are the same every time

In 67 builds, I have never encountered a client whose old website scored above 65 on PageSpeed Mobile when they arrived. Not once. The average is 44. The technical problems are consistent: slow load times, no schema markup, no caching, images not compressed, contact forms routing to inboxes that do not receive the submissions.

This means the bar to improvement is both consistent and measurably achievable. Every client who has come from a Wix site or an old WordPress installation has seen their PageSpeed score improve by at least 35 points. The average improvement is 48 points. That is not because I am doing something extraordinary. It is because the starting point is consistently poor and the fixes are well-understood.

---

## The form problem is the most expensive problem

I expected the ranking and visibility problem to be what most affected my clients. It is significant, and the ranking improvements are real and measurable.

But the problem that has had the most immediate financial impact in the cases I can measure is the form routing problem.

Nomsa, the salon owner in Durban, had been receiving approximately one in three booking submissions. Jaco had received zero leads from his Wix contact form in a year. Priya had received no enquiries through the therapist app she was paying R400 per month for.

In each case, the problem was not demand. Demand existed. The problem was a technical failure in the delivery layer between the customer's intent and the business owner's knowledge of that intent.

Fixing this requires two things: routing form submissions to WhatsApp via a webhook so delivery is instant and reliable, and configuring an SMTP relay for email backup so that the email notifications that do go out are authenticated and not caught by spam filters.

Neither of these requires ongoing expertise. They are configured once at build time. Once configured, every lead submitted at any hour arrives on the business owner's phone within 60 seconds.

---

## What clients underestimate most

Ownership. Almost universally, clients do not fully understand the difference between owning a WordPress site and renting a Wix or Squarespace subscription until I explain it, and even then it takes a moment for the implications to land.

The moment that seems to make it real is when I send the WordPress login before the intake call. Multiple clients have told me that receiving that login, and opening the dashboard and seeing their own domain with administrator access, felt different from what they expected. One client described it as "it feels like actually having something." That is the correct feeling. They actually have something.

The ownership argument matters more as the client's website becomes more central to their business. At month one, the site is new and the risk of platform dependency feels abstract. At month 24, when the site is generating consistent leads and the business has built up content and reviews and ranking positions, the idea of losing all of that because a platform changes its pricing or shuts down is not abstract at all.

---

## What I got wrong early

I underestimated how much the handover session mattered.

Early on, I treated the handover as a practical information transfer: here are your logins, here is how to add a post, here is your Google Site Kit data. I treated it as the end of the project.

What I have learned is that the handover is actually the beginning of the client's relationship with their own website. The clients who have gotten the most from their sites are the ones who came away from the handover understanding what they were looking at in their Google Site Kit dashboard and what those numbers meant for their business.

The client who knows that 50 impressions in week one means 500 is a realistic target in week eight is the client who checks their dashboard every week and responds to what they see. That engagement compounds. The site gets updated. The content gets better. The rankings improve.

The client who receives their logins and never opens the dashboard again has a site that performs below its potential, not because the technical foundation is wrong, but because the working relationship between a site and its owner requires some understanding from the owner.

I now spend more time on the handover session than I did initially, and I follow up three weeks later to check whether the client has any questions about what they are seeing in their dashboard. This single change has produced better client outcomes than any technical improvement I have made.

---

## The surprise that still surprises me

I expected the people who benefited most from a website to be businesses in categories where Google search is the obvious acquisition channel: plumbers, electricians, other tradespeople. Searches with high commercial intent, clear geographic specificity, and few other discovery mechanisms.

What surprised me was how consistently service professionals in personal-trust categories (therapists, coaches, financial advisers, physiotherapists) have seen dramatic booking increases. Priya went from half-booked to fully booked with a waiting list in six weeks.

The reason, when I thought about it, is not actually surprising. People who are searching for a therapist or a financial adviser are doing careful research before they make contact. They are reading about the professional, forming a view of them, deciding whether to trust them. A well-built website that presents the person clearly, in their own voice, with genuine content that demonstrates their knowledge, does something that a Google Business profile or a Psychology Today listing cannot do. It gives the potential client enough to make a decision.

The decision they make, when the website is built correctly, is to enquire. Repeatedly.

---

## What number 67 tells me

I wrote this at build 67 with zero refunds claimed. I am aware this is a number I should not say too confidently, because the next build could go wrong in some way I have not anticipated. But 67 builds without a refund, across a broad range of industries, suburbs, and client types, tells me that the product is consistent.

What I know more clearly at 67 than I did at 40 is that the constraint on growth for South African small businesses is not quality of work. Most of the business owners I have built for are genuinely good at what they do. The constraint is discovery. They are doing good work that not enough people know about.

A website built correctly does not make you better at your job. It makes the people who need your job done able to find you.

---

If you want to be found, book at sabusinessonline.co.za or WhatsApp +27 82 000 0000.
