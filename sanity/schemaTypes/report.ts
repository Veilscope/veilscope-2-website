import { defineArrayMember, defineField, defineType } from "sanity";

const categories = [
  "Company analysis",
  "Research watchlist",
  "Position notes",
  "Thesis updates",
  "Historical case studies",
  "Methodology",
];

const richTextField = (name: string, title: string, required = false) => defineField({
  name,
  title,
  type: "blockContent",
  validation: required ? rule => rule.required().min(1) : undefined,
});

export const report = defineType({
  name: "report",
  title: "Research report",
  type: "document",
  groups: [
    { name: "publication", title: "Publication", default: true },
    { name: "research", title: "Research" },
    { name: "disclosures", title: "Disclosures and sources" },
  ],
  fields: [
    defineField({ name: "company", title: "Company", type: "string", group: "publication", validation: rule => rule.required() }),
    defineField({ name: "title", title: "Report title or question", type: "string", group: "publication", validation: rule => rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "publication",
      options: { source: doc => `${doc.company ?? ""}-${doc.title ?? ""}`, maxLength: 96 },
      validation: rule => rule.required(),
    }),
    defineField({ name: "ticker", title: "Ticker", type: "string", group: "publication", validation: rule => rule.required().uppercase().max(12) }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      group: "publication",
      options: { list: categories.map(title => ({ title, value: title })) },
      validation: rule => rule.required(),
    }),
    defineField({ name: "summary", title: "Summary", description: "Used in the research browser and search results.", type: "text", rows: 4, group: "publication", validation: rule => rule.required().max(360) }),
    defineField({ name: "author", title: "Author", type: "string", group: "publication", validation: rule => rule.required() }),
    defineField({ name: "publishedAt", title: "Publication date", type: "datetime", group: "publication", initialValue: () => new Date().toISOString(), validation: rule => rule.required() }),
    defineField({ name: "dataCutoff", title: "Data cutoff", type: "date", group: "publication", validation: rule => rule.required() }),
    defineField({ name: "updatedAt", title: "Publicly noted update date", type: "datetime", group: "publication" }),
    defineField({
      name: "featuredImage",
      title: "Featured image",
      type: "image",
      group: "publication",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Alternative text", type: "string", validation: rule => rule.required() }),
        defineField({ name: "caption", title: "Caption", type: "string" }),
      ],
    }),
    { ...richTextField("overview", "Overview", true), group: "research" },
    { ...richTextField("attention", "What caught our attention"), group: "research" },
    { ...richTextField("financials", "What the financials show"), group: "research" },
    { ...richTextField("trading", "Trading activity in context"), group: "research" },
    { ...richTextField("context", "The wider business picture"), group: "research" },
    { ...richTextField("interpretation", "Our interpretation"), group: "research" },
    { ...richTextField("counterCase", "The strongest case against our view"), group: "research" },
    { ...richTextField("changeView", "What would change our view"), group: "research" },
    { ...richTextField("position", "Our position"), group: "research" },
    defineField({ name: "positionDisclosure", title: "Position disclosure", type: "text", rows: 3, group: "disclosures", validation: rule => rule.required() }),
    defineField({ name: "otherInterests", title: "Other relevant interests", type: "text", rows: 3, group: "disclosures" }),
    defineField({
      name: "sources",
      title: "Sources",
      type: "array",
      group: "disclosures",
      of: [defineArrayMember({
        type: "object",
        name: "source",
        fields: [
          defineField({ name: "label", title: "Label", type: "string", validation: rule => rule.required() }),
          defineField({ name: "url", title: "URL", type: "url", validation: rule => rule.required().uri({ scheme: ["http", "https"] }) }),
        ],
        preview: { select: { title: "label", subtitle: "url" } },
      })],
    }),
    defineField({
      name: "updates",
      title: "Updates and corrections",
      type: "array",
      group: "disclosures",
      of: [defineArrayMember({
        type: "object",
        name: "reportUpdate",
        fields: [
          defineField({ name: "date", title: "Date", type: "date", validation: rule => rule.required() }),
          defineField({ name: "text", title: "Update", type: "text", rows: 3, validation: rule => rule.required() }),
        ],
        preview: { select: { title: "text", subtitle: "date" } },
      })],
    }),
  ],
  orderings: [{ title: "Publication date, newest", name: "publishedAtDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: {
    select: { title: "title", company: "company", ticker: "ticker", media: "featuredImage" },
    prepare: ({ title, company, ticker, media }) => ({ title: `${company}: ${title}`, subtitle: ticker, media }),
  },
});
