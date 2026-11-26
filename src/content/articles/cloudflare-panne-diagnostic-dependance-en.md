---
title: "Cloudflare is down: the trap of the second incident"
locale: "en"
articleSlug: "cloudflare-panne-diagnostic-dependance"
translationKey: "cloudflare-panne-diagnostic-dependance"
publishedAt: "2026-12-03"
label: "Observability / Engineering"
readTime: "4 min"
excerpt: "Cloudflare’s November 18, 2025 outage seen from the customer side: why diagnosis is so hard in the heat of the moment, and how to avoid making the incident worse by stepping in."
heroImage: "/blog/cloudflare-panne-diagnostic-dependance/cover.webp"
heroImageAlt: "The Unreliable Engineer dressed as a firefighter, extinguisher in hand, in front of a sawtooth error chart, a cloud struck by lightning and a timeline from 11:20 to 17:06"
pillar: "reliability"
intent: "case-study"
primaryQuery: "cloudflare panne diagnostic dependance"
relatedOffer: "diagnostic"
seoTitle: "Cloudflare is down: the trap of the second incident"
seoDescription: "Cloudflare’s November 18, 2025 outage seen from the customer side: why diagnosis is so hard in the heat of the moment, and how to avoid making the incident worse by stepping in."
keywords: ["reliability", "OpenTelemetry", "cloudflare panne diagnostic dependance"]
proofLevel: "experience"
---

On November 18, 2025, I had just finished an eighteen-month engagement at Enedis. So I heard about the Cloudflare outage the way everyone did, through my usual reading. And as usual, I watched LinkedIn influencers jump on it within the day: the Internet is down, here are the four lessons to remember. The Internet always gets carried away.

That day, I was thinking about the team whose site sits behind Cloudflare and who is wondering whether the problem is on their side.

## Even Cloudflare took hours to understand

[Cloudflare’s report](https://blog.cloudflare.com/18-november-2025-outage/) is detailed, and they deserve credit for that transparency. The outage starts at 11:20 UTC. Traffic is mostly back only at 14:30, and everything is normal again at 17:06. At the root, a permissions change on a database doubles the size of a configuration file, and the software reading it crashes.

<figure>
  <img src="/blog/cloudflare-panne-diagnostic-dependance/outage-timeline-en.svg" alt="Timeline of the Cloudflare outage of November 18, 2025: permissions change at 11:05, first errors at 11:20, the wrong lead of a DDoS attack, faulty file identified at 13:37, traffic restored at 14:30, back to normal at 17:06" loading="lazy" />
  <figcaption>How the outage unfolded, based on <a href="https://blog.cloudflare.com/18-november-2025-outage/">Cloudflare’s report</a>. Times in UTC.</figcaption>
</figure>

What strikes me is how long it took the team to understand. The file was regenerated every five minutes, sometimes good, sometimes bad. The network went down, came back, went down again. They first believed it was a DDoS attack. Their status page, hosted elsewhere, went down at the same moment by pure coincidence, and that reinforced the wrong lead.

I’m not going to blame them for it. Every company of that size has piled up layers, and no system is perfect. But it shows what good observability is worth, along with good internal documentation of the effects some components can produce.

## Long incidents are not going away

We are going to see more and more incidents that drag on, despite AI, despite code that is better tested and better observed. The latest example: [the Microsoft 365 outage](https://selectra.info/telecom/actualites/marche/panne-microsoft-365-direct-13-novembre-outlook) (in French), which started on November 12, 2026 and disrupted Outlook, Teams and Copilot for more than 29 hours. According to Microsoft’s status updates as reported by the press, servers brought back into service went down again as soon as they received traffic.

## The mistake I see most often

The mistake I see most often in those moments is the human ability to create what I call in French a surincident: a second incident, caused by the people trying to fix the first one. By stepping in, they make it worse.

During an outage, the charts are chaotic and the data looks like nothing you are used to. You can no longer lean on it to reach a firm diagnosis. Our information systems are systemic, an incident often has several causes, and it is very easy to launch the wrong action and amplify the impact.

There is another trap: sometimes the metrics going wild is normal. A service that restarts absorbs all the queued traffic at once, and the curves panic while everything is actually settling down. Cloudflare describes it too: after the fix, they spent several hours absorbing the load of the traffic coming back.

On the customer side, that looks like a team restarting its instances or rolling back its latest deployment, while the outage is at the provider.

## Knowing whether it is on our side

You need to be able to compare three things, with their timestamps: what a user sees from the outside, the requests the origin actually receives, and what an internal check of that origin says. If the public journey fails and traffic no longer reaches us, application logs without errors prove nothing. The request never reached the service.

I do check the provider’s status page, but I don’t rely on it. On November 18, Cloudflare’s own status page was showing an error.

On multi-CDN setups or switching providers, I don’t have enough experience to recommend anything, so I’ll refrain.

## In 2016, we were mostly looking for someone to blame

This story of a provider going down reminded me of Orange, in 2016. A provider, which I won’t name, hosted the mailboxes. When things broke, the crisis meetings were anything but blameless. On one side: we are not responsible, you are. On the other side, the same thing. We spent more time looking for the culprit than asking how to keep it from happening again. It was a different era.

## Train before you step into the ring

Judging all of this in the heat of the moment is delicate. You need to have been prepared, to have boxed a little, to have done some sparring before stepping into the ring. Especially when top management is on the crisis bridge, chasing you to know when it will be fixed.

The sparring can be very simple: cut a dependency in an isolated environment, and see whether the team finds where the journey breaks. If everyone starts by hunting for a faulty deployment that doesn’t exist, there is still work to do.
