export const siteNavigation = [
  { label: "Research", href: "/research" },
  { label: "Our Approach", href: "/approach" },
  { label: "Tools", href: "/tools" },
  { label: "About", href: "/about" },
  { label: "Get research updates", href: "/updates", featured: true },
] as const;

export const researchCategories = [
  { name: "Company analysis", description: "An examination of a business, its financial performance, and the case we’re investigating." },
  { name: "Research watchlist", description: "Companies that have caught our attention and the questions we’re exploring." },
  { name: "Position notes", description: "The reasoning behind investment decisions we choose to publish." },
  { name: "Thesis updates", description: "New evidence, changing assumptions, and revisions to previously published views." },
  { name: "Historical case studies", description: "Retrospective examinations of financial patterns and what followed." },
  { name: "Methodology", description: "How we define our inputs, investigate patterns, and interpret the evidence." },
] as const;

export const newsletterMessages = {
  unavailable: "Email subscriptions are not open yet.",
  success: "You’re subscribed. Look out for future research and updates from Veilscope.",
  confirmation: "Check your inbox to confirm your subscription.",
  invalidEmail: "Enter a valid email address.",
  error: "We couldn’t complete your subscription. Please try again.",
} as const;

export type ArticleBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "table"; caption: string; columns: string[]; rows: string[][] }
  | { type: "figure"; src: string; alt: string; caption: string; width: number; height: number };

export type ArticleSectionKey =
  | "overview"
  | "attention"
  | "financials"
  | "trading"
  | "context"
  | "interpretation"
  | "counterCase"
  | "changeView"
  | "position";

export type ResearchArticle = {
  slug: string;
  company: string;
  title: string;
  ticker: string;
  category: string;
  author: string;
  publishedAt: string;
  dataCutoff: string;
  updatedAt?: string;
  positionDisclosure: string;
  otherInterests?: string;
  sections: Record<ArticleSectionKey, ArticleBlock[]>;
  sources: { label: string; href: string }[];
  updates: { date: string; text: string }[];
};

// Add only reviewed, publishable reports here. Sanity can replace this adapter later.
export const researchArticles: ResearchArticle[] = [];

export const siteConfig = {
  ownerName: "Veilscope",
  // Keep optional public content absent until reviewed, factual details exist.
  founders: [] as { name: string; role: string; biography: string }[],
  contactEmail: null as string | null,
  newsletterProvider: null as string | null,
  legal: {
    privacyHref: null as string | null,
    termsHref: null as string | null,
    disclosuresHref: null as string | null,
  },
} as const;
