# Mission

## One-liner

A Bangladesh-first marketplace where brands hire creators to post about their products on the creators' own pages and pay safely through the platform. Brands can also buy the video itself for their own ads.

## The problem

Most Bangladeshi sellers sell through Facebook pages and need fresh videos every month. UGC (user-generated content) videos, where a normal person holds a product and talks to the camera, work well because they don't look like ads.

Today a deal usually goes like this:

1. Find a creator through a Facebook group or a friend.
2. Agree a price in Messenger.
3. Send money by bKash.
4. Hope the video comes back on time and is good.

There is no brief, no protection for the brand's money, no guarantee the creator gets paid, and no record of who owns the video.

The bigger pattern is reach, not files. A brand messages a creator's page, sends the product, and the creator posts a video on their own page. What the brand really pays for is a post that goes live and stays up.

## The product

The platform sits in the middle and makes the deal trustworthy.

- **Creators** sign up for free, upload sample videos, link their social pages (platform, followers, average views), pick categories and set a price.
- **Brands** write a brief (or start from a template), pick a creator, choose an order type and pay on the platform.
- **The platform** holds the payment. The creator submits a draft, the brand approves it, and the creator posts it on their own page. Part of the money is released when the post goes live and the rest after it has stayed up for a set number of days, minus the platform's fee.

| Order type | What the brand gets |
| --- | --- |
| `post_on_page` (main) | A post on the creator's own page that stays live for the agreed period |
| `deliver_to_brand` | The finished video file, for the brand's own ads |
| `both` | The post, plus the original file once the order completes |

**Trust is the product.** Brands know their money is safe and the post will go live and stay up. Creators know they will be paid.

## Who it is for

- **Demand:** small and mid-size Facebook-selling businesses in Bangladesh, especially clothes, cosmetics, food and gadgets.
- **Supply:** young Bangladeshi creators who already make Reels and want to get paid for it.

## Goals

1. A working end-to-end flow: brief, hire, pay, draft, approve, post, stay live, payout.
2. A local feel: Bangla briefs, a bKash/Nagad-style payment flow, creators who understand local customers.
3. Good enough to demo, and to test with real users if the market responds.

## Why this project

It is portfolio-first. It may or may not become a business, but it must show full-stack product skill: multi-role auth, video upload, a payment-state workflow, an admin dashboard and thoughtful UX.

## Non-goals (for now)

- Native mobile apps. The site is web-first and mobile-friendly.
- Automatic checking of live posts through the Meta API. Proof of posting is manual.
- Real money. Payments are simulated until the legal side is checked (Digital Commerce Operation Guidelines 2021).
- Ad management, script writing and content calendars (possible later upsells).
- Markets outside Bangladesh.

## Known risks

| Risk | Why it matters | Response |
| --- | --- | --- |
| Quality | One bad video loses a brand | Admin review of creators, revision rounds |
| Holding money | Legal and reputational responsibility | Simulated ledger until legal review |
| Going direct | Brands may skip the platform after one order | Make protection and discovery worth the fee |
| Early takedowns | Released money can't be pulled back | Hold part of the payment until the live period ends |
| Fake reach | Follower counts and screenshots can be faked | Admin checks, ratings, track record |
| Unvalidated numbers | Prices, fee and stay-up days are guesses | Keep them in config; test with real users |

## Success looks like

- One full order moves from brief to payout in the app with no manual workarounds.
- A stranger understands the product from the landing page and demo in under two minutes.
- Optional: a handful of real creators and brands complete orders, to validate demand.
