// Mock blog data. Backend swap point: replace these two functions with
// server-function fetches (createServerFn) reading from Supabase `posts` table.
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
  category: string;
  publishedAt: string; // ISO
  readingMinutes: number;
  cover: string; // solid gradient placeholder handled in component
  body: string[]; // paragraphs
}

const POSTS: BlogPost[] = [
  {
    slug: "why-personal-accounting-matters",
    title: "Why personal accounting quietly outperforms every wealth hack",
    excerpt:
      "The people who build durable wealth aren't chasing tips. They're keeping a clean ledger. Here's the boring habit that compounds.",
    author: "Amina Njoroge",
    authorRole: "Head of Product, Ferron",
    category: "Money mindset",
    publishedAt: "2025-11-04",
    readingMinutes: 6,
    cover: "hero-1",
    body: [
      "Most people track their weight more carefully than their money. That single asymmetry explains a large part of why financial goals slip year after year.",
      "Ferron was built around one belief: if you can see every shilling, dollar, or rupee move across every account you own, you make better decisions almost automatically. No spreadsheets. No shame. Just clarity.",
      "In this piece we walk through the three habits our best-performing users share, and the reports they actually open every week.",
      "Habit one is a Sunday review. Ten minutes, one screen, one question: did my money move toward the life I want? Ferron surfaces this as a single net-flow number with the drivers underneath.",
      "Habit two is naming accounts by purpose, not by bank. `Rent buffer` beats `Savings 2`. Ferron lets you rename and tag accounts freely; your accountant persona uses those names in its advice.",
      "Habit three is letting automation catch the small leaks. Recurring fees, per-transaction cuts, subscription creep. Rules in Ferron shave real money quietly, every month.",
    ],
  },
  {
    slug: "shared-accounts-without-the-fights",
    title: "Shared accounts, without the fights",
    excerpt:
      "Roommates, couples, small teams — a six-digit share code and clear roles make joint money feel like a product, not a negotiation.",
    author: "Daniel Okafor",
    authorRole: "Community Lead",
    category: "Product",
    publishedAt: "2025-10-22",
    readingMinutes: 4,
    cover: "hero-2",
    body: [
      "Money conversations get tense because the source data is usually contested. Whose turn was it? Who paid the WiFi? Where did that transfer come from?",
      "Ferron shared accounts kill that ambiguity. Every member has a role (manager or viewer), every transaction has a creator, and public/private comments keep context where it belongs.",
      "You join a shared account by punching in a six-digit code — no email chains, no invitations lost in spam. Managers approve requests in one tap.",
    ],
  },
  {
    slug: "automation-rules-you-should-turn-on-today",
    title: "Five automation rules you should turn on today",
    excerpt:
      "Recurring rent, per-transaction fees, salary splits — small automations recover hours per month and prevent the tiny errors that add up.",
    author: "Priya Menon",
    authorRole: "Solutions Engineer",
    category: "How-to",
    publishedAt: "2025-10-08",
    readingMinutes: 5,
    cover: "hero-3",
    body: [
      "Automation is not a nice-to-have. It's the difference between an app you check on Sunday and an app that already did the boring work by the time you check it.",
      "Rule one: recurring rent / mortgage. Rule two: fixed subscription bundle. Rule three: per-transaction bank fee auto-deduction. Rule four: salary-to-savings split. Rule five: scheduled zakat/tithe/giving transfer.",
      "Ferron's rule engine runs on the client side of your money — the account you actually see — not on the bank's schedule, so debits and credits reconcile the same day.",
    ],
  },
  {
    slug: "the-numbers-behind-financial-confidence",
    title: "The numbers behind financial confidence",
    excerpt:
      "We looked at anonymised behaviour across 40,000+ Ferron accounts. Three metrics predict confidence better than income does.",
    author: "Amina Njoroge",
    authorRole: "Head of Product, Ferron",
    category: "Research",
    publishedAt: "2025-09-19",
    readingMinutes: 7,
    cover: "hero-4",
    body: [
      "Income matters. But not as much as we thought. Across our data, three behaviours correlate far more strongly with self-reported financial confidence than take-home pay.",
      "First: number of accounts reconciled per week. Second: percentage of transactions with a category attached. Third: presence of at least one automation rule.",
      "None of those cost money. All of them are one-tap habits inside Ferron.",
    ],
  },
];

export function listPosts(): BlogPost[] {
  return [...POSTS].sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt),
  );
}

export function getPost(slug: string): BlogPost | null {
  return POSTS.find((p) => p.slug === slug) ?? null;
}
