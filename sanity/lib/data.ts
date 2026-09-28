import "server-only";
import { cache } from "react";
import { sanityClient } from "@/sanity/lib/client";
import { REPORT_QUERY, REPORTS_QUERY } from "@/sanity/lib/queries";
import type { SanityReport, SanityReportSummary } from "@/sanity/types";

const fetchOptions = { next: { revalidate: 60, tags: ["report"] } };

export const getReports = cache(async (): Promise<SanityReportSummary[]> => {
  if (!sanityClient) return [];
  try {
    return await sanityClient.fetch<SanityReportSummary[]>(REPORTS_QUERY, {}, fetchOptions);
  } catch (error) {
    console.error("Could not load published Sanity reports", error);
    return [];
  }
});

export const getReport = cache(async (slug: string): Promise<SanityReport | null> => {
  if (!sanityClient) return null;
  try {
    return await sanityClient.fetch<SanityReport | null>(REPORT_QUERY, { slug }, fetchOptions);
  } catch (error) {
    console.error(`Could not load Sanity report: ${slug}`, error);
    return null;
  }
});
