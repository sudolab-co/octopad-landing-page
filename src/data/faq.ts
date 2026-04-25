// Single source of truth for the homepage FAQ.
// Used by both the rendered FAQ component and the FAQPage JSON-LD schema.
// Answer strings MUST match character-for-character across both outputs —
// drift will cause Google to flag the schema and drop us from rich results.
// Locked content: Website Content — octopad.ai, Section 7 FAQ v1.2 (2026-04-21).

export interface FAQItem {
  q: string;
  a: string;
}

export const faqs: FAQItem[] = [
  {
    q: 'What is Octopad?',
    a: 'Octopad is a task and knowledge management system built for AI. Where tools like Notion and Asana were designed for humans to write into and AI got bolted on later, Octopad was designed from day one for your AI to read, update, and run the work from. Think of it as the back-office your AI has been missing.',
  },
  {
    q: 'Why should I use Octopad?',
    a: 'Because today you talk to your AI, but the actual work still lands in Notion, Linear, Slack, or a scratchpad somewhere. Octopad lets your AI do the meaningful work with you right inside the chat: planning, tracking, capturing decisions. You still get a clean UI where you can create, edit, and organize tasks, pages, and goals by hand whenever you want. We recommend driving Octopad through your AI rather than the UI, because your AI adds richer context and rationale as it goes, which makes every task easier to run later.',
  },
  {
    q: 'Which AI tools work with Octopad?',
    a: 'Octopad works with any AI that supports the open MCP standard. That already includes Claude (Desktop, Code, claude.ai), ChatGPT, Cursor, and the Gemini CLI, and any new AI tool that adds MCP support plugs in the same way. A few specifics by host: in ChatGPT, Octopad requires developer mode because we are not yet listed as an official OpenAI partner app, and that turns off ChatGPT\'s default session memory unless you flip the toggle that lets it use existing memory while working with Octopad. In Claude, we are working toward inclusion in the official MCP directory so users can find us among verified connectors; today you connect us with a URL. Gemini\'s web app does not speak MCP yet, so only the Gemini CLI is supported. If you switch or add a new AI later, your workspace stays with you.',
  },
  {
    q: 'Can I use Octopad with other tools like Slack or Notion?',
    a: 'Yes. Because Octopad connects through MCP, it chains with every other MCP your AI has connected. You can ask your AI to scan a Slack channel for action items and file them as Octopad tasks, or create a task in Octopad and have the AI message the assignee to explain why they got it. Any tool that speaks MCP becomes part of the same workflow.',
  },
  {
    q: 'How does Octopad store information?',
    a: 'Two formats, both chosen because AI reads them natively. Long-form content like specs, research, and meeting notes lives in markdown pages, the same format every AI model understands best. Atomic pieces of information, decisions, open questions, risks, and key facts, live in a separate typed system where each item is tagged, searchable, and linkable across tasks and pages. Together they give your AI a clean, structured picture of your company, not a pile of documents it has to guess its way through.',
  },
  {
    q: 'What are Octobots?',
    a: 'Octobots are internal agents that run in the background to keep your workspace fresh. They summarize each work stream\'s activity, condense past sessions into short handoffs, and keep a living picture of progress per goal. When your next AI conversation starts, it reads a clean, up-to-date summary instead of a pile of raw logs.',
  },
  {
    q: 'Is it free to try?',
    a: 'Yes. The Free plan lets you set up a workspace and use Octopad with your AI at no cost, no credit card required. Pro is $9 per seat per month, or $7 per seat per month billed annually, for teams that need shared workspaces and more capacity.',
  },
  {
    q: 'How is Octopad different from Claude Projects or ChatGPT Projects?',
    a: 'Projects are read-only folders locked to one AI host. Your AI can read the files you upload, but it cannot write back, and nothing inside carries over when you switch to another AI. Octopad is the opposite: one workspace every AI your team uses can both read and update, so what one assistant learns stays available to the next.',
  },
  {
    q: 'How is Octopad different from Notion, Asana, or Linear?',
    a: 'Notion, Asana, and Linear were built for humans first, with AI bolted on top. Octopad is built for AI first: strategy, tasks, and knowledge live in a structured, typed format any AI you use can actually reason over and write back into. The workspace compounds as your AI works, instead of a filing cabinet your team has to keep in sync by hand.',
  },
  {
    q: 'Can my whole team use it?',
    a: 'Yes. Invite teammates, and each person connects their own AI to the same shared workspace. When one person captures a decision or ships a task, everyone else\'s AI picks it up on the next conversation, so the team stays on the same page without a sync meeting.',
  },
  {
    q: 'What about my data and privacy?',
    a: 'Your data stays yours. Workspace content is never used to train AI models, and it is encrypted in transit and at rest. Access is scoped to your workspace and the roles you assign, so only the people and AIs you authorize can read or update it. You can ask us to delete your account at any time.',
  },
];

export function buildFAQSchema(items: FAQItem[] = faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}

// Subset of FAQ questions that are specifically about pricing.
// Used on the /pricing page for rich results + GEO citation.
export const pricingFaqs: FAQItem[] = faqs.filter((f) =>
  ['Is it free to try?', 'Can my whole team use it?', 'What about my data and privacy?'].includes(f.q),
);
