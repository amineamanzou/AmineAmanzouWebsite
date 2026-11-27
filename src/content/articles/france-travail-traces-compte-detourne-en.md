---
title: "France Travail’s data breach: the measures were known"
locale: "en"
articleSlug: "france-travail-traces-compte-detourne"
translationKey: "france-travail-traces-compte-detourne"
publishedAt: "2026-12-24"
label: "Observability / Engineering"
readTime: "5 min"
excerpt: "The French data protection authority fined France Travail for a breach whose countermeasures had been identified. What access logs really make possible, and why the problem is not technical."
heroImage: "/blog/france-travail-traces-compte-detourne/cover.webp"
heroImageAlt: "The Unreliable Engineer examining a log with a magnifying glass in front of an open padlock, log lines with one in red and silhouettes of exposed people"
pillar: "observability"
intent: "case-study"
primaryQuery: "france travail traces compte detourne"
relatedOffer: "diagnostic"
seoTitle: "France Travail’s data breach: the measures were known"
seoDescription: "The French data protection authority fined France Travail for a breach whose countermeasures had been identified. What access logs really make possible, and why the problem is not technical."
keywords: ["observability", "OpenTelemetry", "france travail traces compte detourne"]
proofLevel: "experience"
---

On January 22, 2026, the CNIL, France’s data protection authority, [fined France Travail](https://www.cnil.fr/fr/violation-de-donnees-sanction-5millions-france-travail) 5 million euros. France Travail is the national employment agency. In early 2024, attackers had taken over accounts of advisers at Cap emploi, a partner network, and accessed the data of everyone registered over the past twenty years, social security numbers included.

The CNIL points to three failings: authentication that was not robust enough, logging that was insufficient to detect abnormal behavior, and access rights that were too broad. And it adds one detail. Most of the appropriate measures had been identified by France Travail in its impact assessments, without ever being implemented.

That detail is what makes me angry. I come back to it at the end.

## What logs have already let me see

I have never built or audited an access logging system. I don’t work in a SOC. I work next to one, I spend time with people who care about SIEM, and above all I am a user of those logs.

At Orange, when I was managing 30 million mailboxes, I spent time in the logs looking for signs of account abuse. The coveted services were known, for example sending SMS from the administration of a business account. Impostors used it to launch phishing campaigns by SMS. The logs were the source of truth for spotting those mass sends, then finding a way to block them.

Today, on an engagement in a cloud like AWS, logging is what tells me who recently modified a resource, who connected to it, who changed a network configuration or an image. When you maintain an information system and you are accountable for its security, you cannot do without it.

## When it is missing

I have been in situations where monitoring and observability did not make it possible to diagnose an incident. Sometimes they did not even tell us whether it was an internal failure or an attack.

You see that mostly in small businesses, in companies with no regulatory obligation. For operators of vital importance or in banks, the law requires ticking those boxes in order to operate. The trap is that it turns into a checklist and a spreadsheet to fill in, and some common sense gets lost along the way.

But it still does some good. At least SSH connections to machines are recorded. You know who ran which command. You can reconstruct an attacker’s path through the system.

## Observability or security: both

To me, access logs need to live in both platforms. They should share the same ingestion system, and you have to guarantee those logs will not be lost during an incident.

They serve two purposes. First, day-to-day operations. Then, at a finer level of granularity, the security experts who diagnose attacks, compromises and account takeovers. If they live in the same tool, all the better, but there has to be a separation. An SRE fixing an incident does not need the same level of detail as a SOC analyst checking that no data has leaked.

<figure>
  <img src="/blog/france-travail-traces-compte-detourne/access-logs-two-uses-en.svg" alt="Diagram: access events go through a shared ingestion, then serve observability for day-to-day operations with reduced detail, and security for diagnosing attacks and account takeovers with fine detail" loading="lazy" />
  <figcaption>The same access logs, read at two levels of detail.</figcaption>
</figure>

On the order of work, on the security side, I rely on a documented process, and the CNIL publishes recommendations on logging as well as on multi-factor authentication. In observability, I always start with authentication, then logging, and then I deal with access rights.

## The problem is not technical

I don’t know what happened inside France Travail. But measures identified and never implemented is a scenario I have seen elsewhere, and my opinion remains the same.

The problem in these organizations is not technical skill, even if they tend to push daily rates down. There are talented people, passionate about their work, contractors and employees alike. They are poorly paid, poorly regarded, with no raises, and they still do their job properly. They report the problems, they raise the alarm, they try to move things forward.

What they get for it is being sidelined by top management. They are sent to a less exposed, less interesting project, and they end up shelved. The subject does not interest management until it is presented a certain way. And it has to be said, technical people often struggle with that. They don’t invest in the packaging.

We have a real top management problem. Too many profiles who are not technical enough, incentivized on politics and on profit, with a commercial vision rather than a technical one. American companies are run by more engineers in senior positions, and that produces a view of the business that takes the technology into account.

So budgets are only released once it hurts, to be able to say the necessary was done and to ease consciences. By then it is too late. The data of French citizens is gone.
