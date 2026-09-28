import type { PortableTextBlock, TypedObject } from "@portabletext/types";

export type ReportImage = TypedObject & {
  _type: "image";
  asset?: { _type: "reference"; _ref: string };
  alt?: string;
  caption?: string;
  crop?: Record<string, number>;
  hotspot?: Record<string, number>;
};

export type ResearchTable = TypedObject & {
  _type: "researchTable";
  caption?: string;
  columns?: string[];
  rows?: { _key?: string; cells?: string[] }[];
};

export type ReportRichText = Array<PortableTextBlock | ReportImage | ResearchTable>;

export type SanityReportSummary = {
  _id: string;
  title: string;
  company: string;
  ticker: string;
  category: string;
  slug: string;
  summary: string;
  publishedAt: string;
  updatedAt?: string;
};

export type SanityReport = SanityReportSummary & {
  author: string;
  dataCutoff: string;
  positionDisclosure: string;
  otherInterests?: string;
  featuredImage?: ReportImage;
  overview?: ReportRichText;
  attention?: ReportRichText;
  financials?: ReportRichText;
  trading?: ReportRichText;
  context?: ReportRichText;
  interpretation?: ReportRichText;
  counterCase?: ReportRichText;
  changeView?: ReportRichText;
  position?: ReportRichText;
  sources?: { _key?: string; label: string; url: string }[];
  updates?: { _key?: string; date: string; text: string }[];
};
