"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { SanityReportSummary } from "@/sanity/types";

const allResearch = "All research";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(value));
}

export function ResearchBrowser({ reports, categories }: { reports: SanityReportSummary[]; categories: readonly string[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(allResearch);
  const filteredReports = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return reports.filter(report => {
      const matchesCategory = category === allResearch || report.category === category;
      const searchable = `${report.company} ${report.ticker} ${report.title} ${report.summary} ${report.category}`.toLocaleLowerCase();
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [category, query, reports]);

  function clearFilters() {
    setQuery("");
    setCategory(allResearch);
  }

  return <section className="site-section section-ruled research-browser-section" aria-labelledby="latest-research-title">
    <div className="site-container">
      <div className="research-browser-heading">
        <div>
          <p className="eyebrow">Publication</p>
          <h2 id="latest-research-title">Latest research</h2>
        </div>
        <div className="research-browser-controls">
          <label>
            <span>Search research</span>
            <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by company, ticker, or topic" />
          </label>
          <label>
            <span>Category</span>
            <select value={category} onChange={event => setCategory(event.target.value)}>
              <option>{allResearch}</option>
              {categories.map(item => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>
      </div>

      <p className="research-result-count" aria-live="polite">{filteredReports.length} {filteredReports.length === 1 ? "report" : "reports"}</p>
      {filteredReports.length > 0 ? <ol className="research-report-list">
        {filteredReports.map(report => <li key={report._id}>
          <Link href={`/research/${report.slug}`}>
            <div className="research-report-meta">
              <span>{report.ticker}</span>
              <span>{report.category}</span>
              <time dateTime={report.publishedAt}>{formatDate(report.publishedAt)}</time>
            </div>
            <div className="research-report-copy">
              <h3>{report.company}: {report.title}</h3>
              <p>{report.summary}</p>
            </div>
            <span className="research-report-action">Read analysis <span aria-hidden="true">↗</span></span>
          </Link>
        </li>)}
      </ol> : <div className="research-no-results">
        <h3>No research matches your search.</h3>
        <p>Try another company, ticker, or topic.</p>
        <button type="button" onClick={clearFilters}>Clear filters</button>
      </div>}
    </div>
  </section>;
}
