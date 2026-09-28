import { defineQuery } from "next-sanity";

export const REPORTS_QUERY = defineQuery(`
  *[_type == "report" && defined(slug.current)]
  | order(coalesce(publishedAt, _createdAt) desc) {
    _id,
    title,
    company,
    ticker,
    category,
    "slug": slug.current,
    summary,
    publishedAt,
    updatedAt
  }
`);

export const REPORT_QUERY = defineQuery(`
  *[_type == "report" && slug.current == $slug][0] {
    _id,
    title,
    company,
    ticker,
    category,
    "slug": slug.current,
    author,
    publishedAt,
    dataCutoff,
    updatedAt,
    summary,
    positionDisclosure,
    otherInterests,
    featuredImage,
    overview,
    attention,
    financials,
    trading,
    context,
    interpretation,
    counterCase,
    changeView,
    position,
    sources,
    updates
  }
`);
