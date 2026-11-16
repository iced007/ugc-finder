# Mission

## One-liner
A Bangladesh-first marketplace where brands hire creators to post about their products on the creators' own pages, and pay safely through the platform. Brands can also buy the video itself for their own ads.

## The problem
UGC (user-generated content) videos, where a normal person holds a product and talks to the camera, work very well as Facebook ads because they don't look like ads. Bangladeshi sellers, most of whom sell through Facebook pages, need fresh videos every month.

Today the process is:
1. Find a creator through a Facebook group or a friend.
2. Agree a price in Messenger.
3. Send money by bKash.
4. Hope the video comes back on time and is good.

There is no proper place to do this. There is no brief, no protection for the brand's money, no guarantee the creator gets paid, and no record of who owns the video.

In practice there is a second, bigger pattern. A brand messages a creator's page, sends the product, and the creator posts the video on their own page. The brand is paying for the creator's reach, and what it really wants is a post that goes live and stays up. That is the main order type here. Handing a video file to the brand is the second.

## What we are building
A platform that sits in the middle and makes the process trustworthy:
- **Creators** sign up for free, upload sample videos, link their social pages (platform, followers, average views), pick categories and set a price.
- **Brands** write a brief (or use a template), pick a creator, choose an order type, and pay on the platform.
- **The platform** holds the payment. The creator submits a draft, the brand approves it, and the creator posts it on their own page. Part of the money is released when the post goes live, and the rest after it has stayed up for a set number of days, minus the platform's cut.

Order types:
- `post_on_page` (main): the creator posts on their own page and keeps it live.
- `deliver_to_brand`: the creator hands the finished video to the brand for its own ads.
- `both`: the post, plus the original file for the brand's ads.

Trust is the product: brands know their money is safe and the post will go live and stay up, and creators know they will be paid.

## Who it is for
- **Primary (demand):** small and mid-size Facebook-selling businesses in Bangladesh, especially clothes, cosmetics, food and gadgets.
- **Primary (supply):** young Bangladeshi creators who already make Reels and want to get paid for it.

## Goals
1. Build a working end-to-end flow: brief, hire, pay, draft, approve, post, stay live, payout.
2. Make it feel local: Bangla briefs, bKash/Nagad-style payment flow, creators who understand local customers.
3. Ship something good enough to demo and, if the market responds, to test with real users.

## Why this project
This is a portfolio-first project. It may or may not become a real business, but it should show full-stack product skill: auth with multiple roles, file/video upload, a payment-state workflow, an admin dashboard, and thoughtful UX.

## Non-goals (for now)
- Native mobile apps (web-first, mobile-friendly).
- Automatic checking of live posts through the Meta API. Proof of posting is manual (link, screenshots, brand confirmation) for now.
- Real money handling at scale (payments are simulated or manual until the legal side is checked, including the Digital Commerce Operation Guidelines 2021).
- Ad management, script writing and content calendars (possible later upsells).
- Support for markets outside Bangladesh.

## Known risks
- **Quality:** one bad video loses a brand. Creators and early deliveries need review.
- **Trust and money:** holding funds is a legal and reputational responsibility.
- **Disintermediation:** brands may go direct to creators after the first order, so the platform has to be worth staying on.
- **Posts taken down early:** once money is released it can't be pulled back, so part of the payment is held until the live period ends.
- **Fake reach:** followers and insights screenshots can be faked, so admin checks and brand ratings matter.
- **Unvalidated numbers:** market size and price figures are rough estimates, not tested facts.

## Success looks like
- A full order can move from brief to payout in the app without manual workarounds.
- A stranger can understand the product from the landing page and demo in under two minutes.
- Optional: a handful of real creators and brands complete orders by hand to validate demand.
