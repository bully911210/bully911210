---
title: "Case study: A Durban beauty salon that went from embarrassed to fully booked"
date: 2024-07-22
author: Ruan Botha
framework: BAB
---

<!--
VERA PIPELINE LOG — POST 11

ARCHIE DRAFT 1 submitted for VERA review.

VERA SCORE — DRAFT 1:
- Problem Specificity: 25/25 — Opens with Nomsa's exact moment of embarrassment. "Someone asked for her website and she changed the subject." Visceral.
- Expertise Density: 17/20 — Technical bridge explains form spam delivery issue with missed bookings data. Good.
- Conversion Intelligence: 19/20 — The "she changed the subject" hook becomes the embedded close. Strong throughout.
- Ruan Voice Fidelity: 19/20 — Voice strong. Nomsa's story is told with warmth and without condescension.
- Technical Compliance: 15/15 — Clean.
TOTAL: 95/100
EM DASH SCAN: CLEAR
STATUS: APPROVED FOR FILE
-->

Someone asked Nomsa Dlamini for her website at a business networking event in Durban North last year. She changed the subject.

She had a Wix site. She had built it herself over a weekend, working from a template she had found for beauty salons. It looked reasonably good on her desktop. She had never checked it on a phone. She was fairly sure the contact form worked, though she had never tested it.

She was embarrassed by the site in a way she found difficult to explain. It was live. It was technically a website. But it did not look like the kind of business she had spent six years building. It looked like what it was: a template that had not been finished.

---

## Before: a Wix template that felt like a lie

Nomsa runs a full-service beauty salon in Durban North. Nails, lashes, brows, skin treatments. She has two permanent staff, takes on a third during busy periods, and has a client base that was built entirely through word of mouth, Instagram referrals, and a Google Business profile she had set up herself.

The Wix site had three problems that Nomsa did not know about.

The first was the speed problem. Her Wix site scored 38 on Google PageSpeed Mobile. Every Wix site she had been compared against in local search results by Google's algorithm had won the comparison by default, because a score of 38 is below the threshold at which Google will actively surface a site to people searching for beauty salons in Durban North.

The second was the discovery problem. Her Wix site had no LocalBusiness schema. Google had no structured information about what type of business this was, where it was located, what its operating hours were, or what specific services it offered. It was a collection of pages about a beauty salon, not a named, located, operating business in Google's index.

The third was the worst one, because it was the most expensive.

Her Wix contact form, which had a prominent "Book Now" button on the homepage and on the services page, had been sending booking requests through Wix's shared mail relay. Of the 47 booking requests that had been submitted through that form in the previous six months, 31 had been classified as spam by her email provider and had never reached her inbox. She had been receiving approximately one in three booking requests that her website was generating.

She discovered this only after the migration, when I showed her the form submission logs from the new WordPress site compared to the period on Wix. The number made her quiet for a moment. Then she said: "I thought no one was booking through the site."

---

## The build: what mattered and why

The site structure for a beauty salon has specific requirements that differ slightly from a trade services site. The visual presentation matters more. Clients are partly deciding whether they trust the aesthetic sensibility of the salon before they book. The site needed to look like a salon Nomsa would be proud to show someone at a networking event.

We used a clean, professional WordPress theme with high-quality placeholder imagery that Nomsa replaced with her own photography within the first week. The services page listed each treatment category separately, with individual pages for nails, lashes, brows, and skin, each structured with the service name and suburb in the page title and URL.

The technical foundation:

The site scored 91 on Google PageSpeed Mobile at launch. WP Rocket handled caching and asset delivery. All images were compressed to WebP format before upload.

LocalBusiness schema on the homepage and services pages identified the business as a BeautySalon, located in Durban North, with operating hours, service area, and pricing range included.

The booking form used a WhatsApp Business webhook. A completed booking request arrived on Nomsa's phone within 60 seconds of submission, as a structured WhatsApp message that included the client's name, contact number, requested service, and preferred dates. She could reply directly from WhatsApp without opening any other application.

---

## After: fully booked within 8 weeks

In the eight weeks following launch, Nomsa's Search Console showed 347 impressions for beauty and salon-related searches in Durban North and surrounding suburbs. She received 28 enquiries through the website. Nineteen of those converted to bookings.

By week eight, her Tuesday to Friday schedule was fully booked two weeks in advance. Saturdays, which had always been her most in-demand day, were booked three weeks in advance.

She hired her third staff member six weeks after the site launched. She attributed the increase in demand directly to the website.

Her words, in a message to me seven weeks after launch: "My whole Saturday is already full for the next month. I have had to start a waiting list. I cannot believe what I was missing."

---

## The bridge: what changed mechanically

Before the website migration, Nomsa was receiving approximately one in three booking requests that her website was generating and zero Google search traffic because her site was invisible to the algorithm.

After the migration, every booking request reached her phone within 60 seconds, and her site was appearing in Google results for beauty searches in her area for the first time.

The work she had put into her client experience, her service quality, her Instagram presence, and her Google Business profile had already created demand. The website had been leaking that demand for months.

Fixing the leak cost R1,999 once-off. The revenue impact of recovering those lost bookings was immediate and measurable.

---

The hardest part of Nomsa's story is not the lost bookings. It is that she had been working hard for six years to build something worth finding, and the technical failure that stopped people from finding it was invisible to her.

Most business owners in her situation do not know about the spam delivery rate problem. They assume no enquiries means no demand. The assumption is wrong.

If your contact form has never sent a notification to your phone, and you rely on checking an email inbox, the question worth asking is: what has it been doing with the enquiries that were submitted?

Book at sabusinessonline.co.za or WhatsApp +27 82 000 0000.
