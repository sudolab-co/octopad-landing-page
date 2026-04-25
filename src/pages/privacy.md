---
layout: ../layouts/LegalLayout.astro
title: Privacy Policy | Octopad
description: How Octopad collects, uses, shares, and protects your personal data, plus your rights under GDPR, UK GDPR, Swiss FADP, CCPA/CPRA, and other applicable privacy laws.
---

# Privacy Policy

**Version 1.4** · **Effective 25 April 2026** · **Last updated 25 April 2026**

## At a glance

Octopad is a shared workspace where you and your AI assistants collaborate on projects. To run that service, we collect the information you give us when you create an account, the content you store in your workspace, and basic usage information. We never sell your personal data, we never use your workspace content to train external AI models, and you can export or delete your data at any time. This policy explains what we collect, why we collect it, who we share it with, how long we keep it, and the rights you have under EU/UK, US, and other applicable laws.

If you only read one section, read **Section 9 Your rights** below.

## 1. Who we are

Octopad is operated by **Beemo Consulting FZCO**, a free zone company established under the laws of the United Arab Emirates (License No. 10996, Tax Registration Number 104842509200001), with its registered office at Unit 101, IFZA Dubai Building A2, Dubai Silicon Oasis, Dubai, UAE ("**Octopad**", "**we**", "**us**", "**our**").

For all questions about this Privacy Policy or about how we handle your personal data, you can write to us at **support@octopad.ai**.

Where this Privacy Policy uses the words "**personal data**", we mean any information that relates to an identified or identifiable natural person, as defined under the EU General Data Protection Regulation (Regulation (EU) 2016/679) ("**GDPR**") and equivalent laws in your jurisdiction.

We are in the process of appointing our representative in the European Economic Area pursuant to Article 27 of the GDPR, and our representative in the United Kingdom pursuant to Article 27 of the UK GDPR. Once these representatives are appointed, their contact details will be published in this section. In the interim, all data subject inquiries can be directed to **support@octopad.ai** and we will respond within the timelines set by the law that applies to you.

**Lead jurisdiction.** Because Octopad is operated by a UAE-established company, our processing is primarily governed by **UAE Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data ("UAE PDPL")** and its implementing regulations. Where you use Octopad from a jurisdiction with its own data protection law, that law also applies and we honour it. The jurisdiction-specific supplements in **Section 9** describe rights that go beyond UAE PDPL.

**Data Protection Officer.** We have not appointed a Data Protection Officer because we do not meet the mandatory designation criteria of GDPR Article 37(1) (no large-scale special category processing, no large-scale systematic monitoring of data subjects as a core activity). We keep this position under review as the user base grows. For all data protection inquiries, write to **support@octopad.ai**.

## 2. Scope of this Privacy Policy

This Privacy Policy applies to:

- The Octopad marketing website at **octopad.ai** and any subdomains;
- The Octopad product application at **octopad.app**;
- The Octopad MCP server and any official client integrations we publish;
- All related communications, including transactional emails, in-app notifications, and customer support exchanges.

This Privacy Policy does not apply to third-party services you choose to connect to your Octopad workspace, including Slack, Telegram, GitHub, Notion, AI providers, payment processors, and any other integration. When you connect those services, the third party's own privacy policy governs how they handle your data on their side. Our subprocessors are listed in **Section 6** below.

## 3. The personal data we collect

We collect personal data in three ways: (a) information you give us directly, (b) information we collect automatically when you use the service, and (c) information we receive from third parties that you authorize.

### 3.1 Information you give us

| Category | Examples | Why we collect it |
|---|---|---|
| Account identifiers | Name, email address, profile picture, time zone, and authentication credentials managed through Supabase Auth. If you sign in with a password, we store only a hashed and salted form of it. If you sign in through an OAuth provider (Google, GitHub, etc.), we store the provider identifier and the email associated with that provider account. | To create and operate your account |
| Workspace content | Tasks, work streams, goals, knowledge entries (key facts, decisions, questions, risks), pages, files, comments, and integration data | To deliver the core feature: a workspace that persists across sessions |
| Billing information | Billing name, billing email, billing address, VAT or tax identifier, last four digits of payment card, card brand, country of card issue. Full card numbers are processed by Stripe and never reach our servers. | To bill you for paid plans and meet our tax and accounting obligations |
| Support correspondence | Anything you write to us by email, in-app chat, or through the in-app feedback button | To answer your question or resolve your issue |
| Voluntary survey responses | Anything you choose to share when we run a survey or interview | To improve the product. Always opt-in. |

### 3.2 Information we collect automatically

| Category | Examples | Why we collect it |
|---|---|---|
| Session metadata | When a session started and ended, which AI client connected (Claude, ChatGPT, Cursor, etc.), which workspace was active, the model identifier reported by the client, and the high-level outcome (completed vs. interrupted) | To deliver the cross-session continuity feature, troubleshoot session issues, and surface activity in the dashboard |
| Tool call telemetry | Which MCP tools were invoked, how long each call took, success or error codes, and aggregate counts. We do not retain the textual arguments and outputs of every call beyond what is necessary to render activity logs and debug failures. | To monitor reliability, plan capacity, and detect abuse |
| Device and connection data | IP address, browser user-agent, device type, language preference, and approximate location derived from IP at country and city level | To secure your account, prevent fraud, and comply with applicable law |
| Cookies and similar technologies | See **Section 11** | See **Section 11** |

### 3.3 Information from third parties

If you sign in with an OAuth provider (Google, GitHub, etc.) or connect an integration (Slack, Telegram, GitHub, Notion, etc.), the provider sends us the data fields you authorized in the consent screen, typically including a user identifier, an email address, and any scopes the integration needs to function. The exact data set depends on the provider and on the scopes you grant.

If you pay for a subscription, Stripe sends us a customer identifier, the subscription status, the last four digits of the card, the card brand, the country of issue, and the billing address. Stripe holds the full card details under its own PCI DSS Level 1 certification.

### 3.4 What we do not collect

- We do not deliberately collect special category data (racial or ethnic origin, political opinions, religious beliefs, trade union membership, genetic data, biometric data, health data, or data concerning your sexual orientation). If you place such data into your workspace voluntarily, you do so at your own discretion.
- We do not buy personal data from data brokers.
- We do not run advertising trackers and we do not embed third-party advertising pixels.

### 3.5 Whether providing your personal data is required

This disclosure is made under GDPR Article 13(2)(e) and equivalent laws.

| Personal data | Is provision required? | What happens if you do not provide it |
|---|---|---|
| Account identifiers (name, email, authentication credential) | Required by contract | We cannot create an account for you and you cannot use the service. |
| Billing information (for paid plans) | Required by contract and by tax law (UAE Federal Decree-Law No. 28 of 2022) | We cannot bill you, so you cannot subscribe to a paid plan. |
| Workspace content | Optional in principle, but the service has no purpose without it | The service still works, but a workspace with no content delivers no value. |
| Marketing communications email address | Optional, consent-based | You will not receive product updates, newsletters, or marketing. The rest of the service is unaffected. |
| Cookies and analytics (where consent is required) | Optional, consent-based | The site still works. We will see less aggregate data on how the site is used. |
| Session metadata, telemetry, security logs | Collected automatically as part of operating the service | You cannot opt out of this data while using the service, because it is required for security and reliability. You can stop the collection by not using the service. |

## 4. How we use your personal data and our legal bases

For users in the European Economic Area and the United Kingdom, GDPR Article 6 requires us to identify a legal basis for each processing purpose. The table below sets out our purposes and the corresponding legal basis.

| Purpose | Legal basis (GDPR Article 6) |
|---|---|
| Creating and operating your account, providing the workspace, persisting your data across sessions, syncing between MCP clients | Performance of a contract (Article 6(1)(b)) |
| Processing payments, sending invoices, meeting tax and accounting obligations | Performance of a contract and compliance with a legal obligation (Article 6(1)(b) and (c)) |
| Sending you transactional emails (account confirmations, password resets, billing receipts, important service notices) | Performance of a contract (Article 6(1)(b)) |
| Securing the service, detecting and preventing abuse, fraud, or unauthorized access, maintaining backups, applying rate limits | Our legitimate interests in operating a secure service (Article 6(1)(f)) |
| Running diagnostic logs, telemetry, and aggregate product analytics so the product can be improved and stabilized | Our legitimate interests in improving the service (Article 6(1)(f)) |
| Sending you product update emails, newsletters, or marketing about features and offers | Your consent (Article 6(1)(a)). You can withdraw consent at any time using the unsubscribe link in any such email or in your account settings. |
| Providing customer support and answering your questions | Performance of a contract and our legitimate interest in supporting users (Article 6(1)(b) and (f)) |
| Enforcing our Terms of Service, defending legal claims, exercising our rights | Our legitimate interests in protecting our business and compliance with legal obligations (Article 6(1)(f) and (c)) |

**Legitimate interests assessment.** Where we rely on Article 6(1)(f), the specific legitimate interests are: (a) operating a secure service free of fraud, abuse, account takeover, and unauthorised access; (b) keeping the service stable, performant, and debuggable through aggregate telemetry; (c) responding to and supporting our users; and (d) protecting our business and exercising our legal rights. We have weighed these interests against your rights and freedoms, including your reasonable expectations as a user of a B2B SaaS, and we apply the safeguards in **Section 10** (security) and **Section 7** (transfer protections) to protect you. You can object to processing based on our legitimate interests under **Section 9.2** below.

**Automated decision-making.** We do not engage in automated decision-making that produces legal effects on you, or that similarly significantly affects you, within the meaning of GDPR Article 22.

**AI features and your workspace content.** Octopad does two distinct kinds of AI processing, governed differently:

1. **AI assistants you connect.** Through the Model Context Protocol you can connect AI clients (Claude Desktop, ChatGPT, Cursor, and others) and AI providers to your workspace. Those clients and providers operate under your instructions, not ours, and their handling of your data is governed by their own terms and privacy policies. We recommend you review them.
2. **Octopad-initiated AI processing (system octobots and embeddings).** To provide cross-session continuity, summarisation, semantic search, and other product features, Octopad sends portions of your workspace content to AI providers we engage as our subprocessors (listed in **Section 6.1**). Those providers process your data on our documented instructions and are contractually prohibited from using it to train their own models. The legal basis is performance of a contract (Article 6(1)(b)), because these features are part of the service we provide.

**No external model training.** We do not use your workspace content to train, fine-tune, or evaluate any artificial intelligence model offered by us or by any third-party AI provider, beyond the purely operational processing described in (2) above.

## 5. Categories of data subjects

Depending on how you use Octopad, your workspace may contain personal data about other people, for example teammates you invite, contacts you mention in a knowledge entry, or third parties you reference in a task. When that happens, you act as the data controller for that personal data and Octopad acts as the data processor on your behalf, in accordance with **Section 14** below.

**Notice to non-account data subjects (GDPR Article 14).** If you have ended up on this page because someone added your personal data to their Octopad workspace and you want to understand what is happening with it: the categories of data Octopad may hold about you are listed in **Section 3**, the categories of recipients in **Section 6**, the retention periods in **Section 8**, the international transfer mechanisms in **Section 7**, and the rights you can exercise in **Section 9**. The source of your data, in this case, is the Octopad customer who placed it into their workspace. To exercise your rights, you can write to that customer directly, or to **support@octopad.ai** and we will route the request to the relevant customer and assist as their data processor.

## 6. Who we share your personal data with

We share your personal data only with the following categories of recipients, and only as necessary for the purposes set out in **Section 4**.

### 6.1 Service providers (subprocessors)

We rely on the following service providers to operate Octopad. Each one is bound by a written contract that includes the data protection terms required by GDPR Article 28 or equivalent local law. We hold each of them to the standards set out in this Privacy Policy.

| Subprocessor | Service | Region of processing |
|---|---|---|
| Supabase, Inc. | Database, authentication, file storage | United States |
| Vercel, Inc. | Hosting for the marketing site (octopad.ai) | United States and edge regions |
| Railway Corporation | Hosting for the product application (octopad.app) and the MCP server backend | United States |
| Cloudflare, Inc. | Content delivery network, DDoS and bot mitigation, edge caching for octopad.ai and octopad.app | United States and global edge network |
| Stripe, Inc. and Stripe Payments Europe Limited | Payment processing and subscription management | United States and Ireland |
| Resend, Inc. | Transactional and account emails | United States |
| Slack Technologies, LLC | Outbound delivery of system notifications via the Octopad Slack app, where the workspace owner has connected Slack as a notification destination | United States |
| Telegram Messenger Inc. | Outbound delivery of system notifications via the Octopad Telegram bot, where the user has connected Telegram as a notification destination. Telegram designates the European Data Protection Office (EDPO) as its EEA Article 27 representative. | Outside the EEA, on Telegram's global infrastructure |
| Mixpanel, Inc. | Product analytics (event tracking, funnels, retention) | United States |
| PostHog, Inc. | Product analytics (event tracking, feature flags). Configured so that PostHog does not store client IP addresses, does not create individual user profiles, and does not record session replays. | United States |
| Functional Software, Inc. (Sentry) | Error and crash reporting. Configured so that Sentry does not store IP addresses, does not collect personally identifiable information by default, and does not correlate errors to specific user accounts. | United States |
| Anthropic PBC | AI processing for Octopad's system octobots (Claude Haiku 4.5 and Sonnet 4.5), used to summarise sessions, generate progress reports, reconcile work streams, and run other server-side automations on portions of your workspace content | United States |
| OpenAI OpCo LLC | AI embedding generation (text-embedding-3-small), used to embed pages, files, and search queries so that semantic search and related features work on your workspace content | United States |

We will update this table and notify users in line with **Section 15** before adding any new subprocessor.

### 6.2 Optional integrations you authorize

If you choose to connect an integration, we exchange data with that integration only as required to deliver the feature you turned on, and only with the scopes you granted in the consent screen. You can revoke any integration at any time from your workspace settings. The integrations available at the date of this policy are:

- **Slack** (Slack Technologies, LLC) — for inbound interactions, such as replying to comments via threaded Slack messages and using the Octopad Slack app within your workspace. (When Octopad sends *outbound* notifications via Slack, Slack acts as our subprocessor and is also listed in **Section 6.1**.)
- **Telegram** (Telegram Messenger Inc.) — for inbound interactions with the Octopad Telegram bot. (When Octopad sends *outbound* notifications via Telegram, Telegram acts as our subprocessor and is also listed in **Section 6.1**.)
- **GitHub** (GitHub, Inc., a subsidiary of Microsoft Corporation) for issue and code-related sync.
- **Notion** (Notion Labs, Inc.) for one-time imports.
- **AI providers connected through the Model Context Protocol** (Anthropic PBC, OpenAI OpCo LLC, and any other provider you authorise through your AI client) — these are AI providers *you* connect from your AI client. They are different from the AI providers Octopad engages on its own (see **Section 6.1**).

### 6.3 Professional advisers

We may share personal data with our lawyers, auditors, accountants, and similar professional advisers, where necessary, under duties of confidentiality.

### 6.4 Authorities and law enforcement

We may disclose personal data if we believe in good faith that disclosure is necessary to comply with a legally binding request from a competent authority, to enforce our Terms of Service, to defend legal claims, or to protect the rights, property, or safety of our users, our business, or the public. Where we are legally permitted to do so, we will notify you before responding to a request that targets your account.

### 6.5 Business transfers

If we are involved in a merger, acquisition, financing round, restructuring, or sale of assets, your personal data may be transferred as part of that transaction. This includes any future migration of the Octopad business from Beemo Consulting FZCO to a dedicated Octopad operating entity. In any such transfer, the receiving entity will be required to honor the commitments in this Privacy Policy. We will notify you of the change in line with **Section 15** below before any transfer takes effect.

We do not sell your personal data. We do not share your personal data for cross-context behavioral advertising.

## 7. International data transfers

Octopad is operated from the United Arab Emirates and our subprocessors are primarily located in the United States. Personal data therefore moves between the UAE, the United States, and any region your subprocessors' edge nodes reach. When you use Octopad from the European Economic Area, the United Kingdom, Switzerland, or any other jurisdiction with similar transfer restrictions, your personal data is transferred outside that jurisdiction.

We rely on the following transfer mechanisms:

- **From the European Economic Area to the United States:** the **EU-US Data Privacy Framework** where the recipient subprocessor is currently certified, and otherwise the **Standard Contractual Clauses** approved by the European Commission (Implementing Decision (EU) 2021/914 of 4 June 2021), with **Module Two (Controller to Processor)** for the transfer between the customer-controller and Octopad-as-processor, and **Module Three (Processor to Processor)** for our onward transfers to subprocessors that act as processors of yours.
- **From the United Kingdom to the United States:** the **UK International Data Transfer Addendum** (UK IDTA, version A1.0, in force 21 March 2022) layered onto the EU SCCs above, where the DPF UK extension does not apply.
- **From Switzerland to the United States:** the EU SCCs adapted for Swiss transfers in line with the recognition published by the Swiss Federal Data Protection and Information Commissioner (FDPIC), with references to GDPR construed as references to FADP, references to EU Member State law construed as references to Swiss law, and the FDPIC as the competent supervisory authority. (There is no separate "Swiss Addendum" instrument equivalent to the UK IDTA; the SCCs themselves are adapted.)
- **From the United Arab Emirates outbound:** transfers from the UAE to other countries comply with **UAE PDPL Articles 22 and 23** on cross-border transfers, relying on adequacy determinations issued by the UAE Data Office where available and on appropriate contractual safeguards equivalent to the SCCs otherwise.
- **For transfers to all other countries:** the same Standard Contractual Clauses with any necessary supplementary measures.

**Schrems II supplementary measures.** Recognising that US providers may receive law enforcement or surveillance requests under FISA Section 702 and Executive Order 12333, we apply the following supplementary measures to all transfers, regardless of mechanism: encryption in transit using TLS 1.2 or higher, encryption at rest using AES-256, strict access controls including row-level security and least-privilege production access, contractual confidentiality and challenge-the-request obligations on each subprocessor, and data minimisation in the categories of personal data we hand to each subprocessor (described in **Section 6.1**).

You can request a copy of the relevant transfer safeguards by writing to **support@octopad.ai**.

## 8. How long we keep your personal data

We keep personal data only for as long as we need it for the purposes set out in **Section 4**. The default retention periods are below. Where law requires us to keep certain data for longer (for example, accounting records under UAE Federal Decree-Law No. 28 of 2022 and applicable VAT legislation), the longer period prevails.

| Category | Default retention |
|---|---|
| Account identifiers (name, email, hashed authentication credential) | Until you delete your account, then 30 days in soft-delete to allow recovery, then deletion from active production systems and overwriting from encrypted backups within a further 90 days |
| Workspace content (tasks, pages, knowledge, files) | Until you delete the content or your account. After deletion, content is removed from active databases within 30 days and from encrypted backups within 90 days. |
| Billing records and invoices | Seven (7) years after the end of the relevant tax period, as required by UAE law |
| Session metadata, tool call telemetry, security logs | 12 months from the date of the event, then aggregated and anonymized |
| Support correspondence | 24 months from the date of the last message |
| Marketing consent records (proof you opted in, when, and from where) | Until you withdraw consent, then deleted within 30 days |
| Marketing suppression list (your email on a do-not-contact list once you unsubscribe) | Indefinite, because the law requires us to honour your unsubscribe across future re-imports of any list |

If you ask us to delete your account, we honor the request within 30 days and notify our subprocessors to do the same. Encrypted backups are overwritten on a rolling 90-day cycle. Aggregated and anonymized data that no longer identifies you may be kept indefinitely for product analytics.

## 9. Your rights

This section describes the rights you have over your personal data. Most of these rights apply everywhere, although the exact scope and the response timelines depend on the law that applies to you. To exercise any right, write to **support@octopad.ai** and tell us which right and which account. We will respond within the timeline set by the law that applies to you (typically 30 days).

### 9.1 Rights available to all users

- **Access.** You can ask for a copy of the personal data we hold about you.
- **Export.** You can export your workspace content from your account settings at any time.
- **Correction.** You can correct inaccurate or incomplete personal data, either yourself in account settings or by writing to us.
- **Deletion.** You can delete your account and your workspace content at any time. See retention rules in **Section 8**.
- **Object to marketing.** You can opt out of marketing emails using the unsubscribe link in any such email, or by writing to us.

### 9.2 Additional rights for users in the European Economic Area, the United Kingdom, and Switzerland

Under GDPR, UK GDPR, and the Swiss Federal Act on Data Protection, you also have:

- **The right to restriction of processing** in certain circumstances.
- **The right to data portability** for personal data you provided to us, processed by automated means under a contract or consent basis.
- **The right to object** to processing based on our legitimate interests, including profiling.
- **The right to withdraw consent** at any time, where consent is the legal basis we rely on. Withdrawal does not affect the lawfulness of processing carried out before the withdrawal.
- **The right to lodge a complaint** with the supervisory authority in the EU or EEA member state where you live, work, or where the alleged infringement took place. The list of national authorities is at https://www.edpb.europa.eu/about-edpb/about-edpb/members_en. UK users can complain to the Information Commissioner's Office at https://ico.org.uk/make-a-complaint/. Swiss users can complain to the Federal Data Protection and Information Commissioner at https://www.edoeb.admin.ch.

### 9.3 Additional rights for California residents (CCPA / CPRA)

Under the California Consumer Privacy Act as amended by the California Privacy Rights Act, California residents have the rights set out below.

**Categories of personal information we collect, mapped to the CCPA statutory categories** (Cal. Civ. Code §1798.140(v)):

| CCPA category | Examples we collect | Sources | Business / commercial purposes | Disclosed to |
|---|---|---|---|---|
| Identifiers | Name, email, account ID, IP address, device identifiers | You; OAuth providers; automatic | Account operation, security, support, analytics | Subprocessors in **Section 6.1** |
| Customer records (Cal. Civ. Code §1798.80(e)) | Billing name, billing address, last four digits of card | You; Stripe | Billing, tax compliance | Stripe; tax authorities on legal request |
| Commercial information | Subscription plan, transaction history | Automatic | Billing, account operation | Stripe |
| Internet or other electronic network activity | Pages viewed, clicks, session metadata, tool call telemetry | Automatic | Service operation, analytics, security | Mixpanel, PostHog (analytics with consent); Supabase, Vercel, Railway, Cloudflare (operational) |
| Geolocation data (approximate, IP-derived to city level) | Approximate city and country | Automatic | Security, fraud prevention, language preference | Subprocessors in **Section 6.1** |
| Professional or employment information | Job titles, organisations, roles (only as you place them in your workspace) | You | Workspace functionality | Subprocessors in **Section 6.1** |
| Inferences | None drawn from collected data | n/a | n/a | n/a |
| Sensitive personal information (Cal. Civ. Code §1798.140(ae)) | Account credentials (hashed) | You | Account authentication | Supabase Auth |

**Your rights:**

- **Right to know** the categories and specific pieces of personal information we have collected, the categories of sources, the business or commercial purposes for collection, and the categories of third parties with whom personal information is shared (covered above and in **Sections 3 and 6**).
- **Right to delete** personal information, subject to the exceptions in CCPA (for example, to comply with a legal obligation, to detect security incidents, to debug, to enable internal uses reasonably aligned with your expectations).
- **Right to correct** inaccurate personal information.
- **Right to data portability** to obtain a copy of your personal information in a portable, readily usable format.
- **Right to opt out of the sale or sharing of personal information** for cross-context behavioural advertising. **We do not sell or share personal information in this sense, so there is nothing to opt out of.**
- **Right to limit the use and disclosure of sensitive personal information.** We use sensitive personal information only for the purposes for which you provided it (account authentication) and not for any purpose that requires a separate opt-out.
- **Right to non-discrimination.** We will not deny you the service, charge you a different price, or provide a different level of quality because you exercised any of these rights.

**How to exercise these rights** (two methods, satisfying CCPA Regs §7020(c)):

1. **Email:** **support@octopad.ai** with the subject line "California privacy request — [right you wish to exercise]".
2. **In-app form:** the Privacy request form in your account settings (Privacy → Submit a privacy request).

**Authorised agent.** You can designate an authorised agent to act on your behalf by giving the agent signed written permission. We will verify both the agent's authority and your identity.

**Verification.** We use a risk-based approach in line with CCPA Regs §§7060–7062. For requests to **know categories**, we verify that the request comes from the email address on file. For requests to **know specific pieces** of personal information, to **delete**, or to **correct**, we additionally require sign-in to the account, or, where you do not have an account, a signed declaration under penalty of perjury that you are the person whose information is the subject of the request. For sensitive requests we may ask for additional information sufficient to match the request to the personal information we hold.

### 9.4 Additional rights for residents of other US states

Residents of Virginia, Colorado, Connecticut, Utah, Texas, Oregon, Montana, Tennessee, Iowa, Indiana, Delaware, New Jersey, New Hampshire, Minnesota, Maryland, Rhode Island, Kentucky, and any other US state with a comprehensive consumer privacy law have rights similar to those described in **Section 9.3**, including the right to access, delete, correct, and port personal information, and to opt out of targeted advertising and the sale of personal information. We extend the same intake process and verification described above to all US state residents.

### 9.5 Additional rights under other privacy laws

If you are protected by Brazil's Lei Geral de Proteção de Dados (LGPD), Canada's Personal Information Protection and Electronic Documents Act (PIPEDA) and any provincial equivalent, the UAE Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data, Australia's Privacy Act 1988, New Zealand's Privacy Act 2020, or another comprehensive data protection law, you have rights similar to those described above. Please contact us and we will respond in line with the law that applies to you.

## 10. How we secure your personal data

We apply appropriate technical and organizational measures to protect your personal data, including:

- **Encryption in transit** using TLS 1.2 or higher for all client connections.
- **Encryption at rest** using AES-256 for the primary database and for file storage.
- **Row-level security policies** in the database so that a query made on behalf of one user cannot return rows belonging to another user.
- **Workspace-scoped access control** at the application layer, with separate JSON Web Tokens minted for each request.
- **Access logging and monitoring** of administrative actions on the production environment.
- **Least-privilege access** for our team. Production access is limited to the minimum number of people required to operate the service.
- **Vulnerability management**, including dependency scanning, peer code review, and a structured incident response procedure.

No security control is perfect. If you discover a vulnerability, please report it to **support@octopad.ai**.

## 11. Cookies and similar technologies

We use cookies and similar technologies for three purposes:

| Type | Purpose | Lawful basis |
|---|---|---|
| Strictly necessary | Authenticate your session, remember which workspace you are in, prevent cross-site request forgery | Necessary to deliver the service you requested |
| Functional | Remember your interface preferences, such as theme and language | Your consent, where consent is required |
| Analytics | Understand aggregate usage so we can improve the product | Your consent, where consent is required |

We do not use advertising cookies. The cookie consent banner shown to visitors in the European Economic Area, the United Kingdom, Switzerland, and similar jurisdictions lets you accept, reject, or selectively allow non-essential categories. You can change your choice at any time from the **Cookie preferences** link in the website footer.

## 12. Data breach notification

If we become aware of a personal data breach that is likely to result in a risk to your rights and freedoms, we will notify the competent supervisory authority within 72 hours of becoming aware, in line with GDPR Article 33. If the breach is likely to result in a high risk to your rights and freedoms, we will also notify you directly without undue delay, in line with GDPR Article 34. Notifications under other laws will follow the timelines set by those laws.

## 13. Children's privacy

Octopad is not directed to children. You must be at least **16 years old** to create an account. We chose 16 as the strictest threshold permitted under **GDPR Article 8** (which allows EEA Member States to set a digital-services age between 13 and 16) and a threshold above the **United States COPPA** floor of 13 (15 U.S.C. §6501) and the **Brazilian LGPD** child threshold under Article 14. If your local law sets a different age, the stricter of the two applies.

If you are a parent or guardian and you believe a person under 16 has provided us with personal data, contact us at **support@octopad.ai** and we will delete it.

## 14. When you act as data controller and we act as processor

When you create a workspace and place personal data about other people into it (teammates, contacts, third parties), you are the data controller for that personal data and we are your data processor. The terms of our data processing relationship are set out in our Data Processing Addendum, published at **octopad.ai/dpa** and auto-incorporated into our Terms of Service when you use the service to process personal data of third parties. The DPA incorporates the Standard Contractual Clauses for controller-to-processor and processor-to-subprocessor transfers, as applicable.

## 15. Changes to this Privacy Policy

We may change this Privacy Policy from time to time. If we make a material change, we will give you at least **30 days' advance notice** by email and by an in-app banner before the change takes effect. The version number and the effective date at the top of the policy will always reflect the version in force.

## 16. How to contact us

For privacy questions, data subject requests, complaints, or to ask for a copy of any of our data protection documentation, you can reach us via any of the following:

- **Email:** support@octopad.ai
- **In-app:** Privacy request form in your account settings (Privacy → Submit a privacy request)
- **Postal address:** Beemo Consulting FZCO, Unit 101, IFZA Dubai Building A2, Dubai Silicon Oasis, Dubai, United Arab Emirates

For data subjects in the EEA, the United Kingdom, or Switzerland, the contact details of our Article 27 representatives will be added here once those representatives are appointed (see **Section 1**).
