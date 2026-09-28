import Image from "next/image";
import Link from "next/link";
import { createImageUrlBuilder } from "@sanity/image-url";
import { PortableText, type PortableTextComponents } from "next-sanity";
import { dataset, projectId } from "@/sanity/env";
import type { ReportImage, ResearchTable, SanityReport } from "@/sanity/types";

const sectionLabels = {
  overview: "Overview",
  attention: "What caught our attention",
  financials: "What the financials show",
  trading: "Trading activity in context",
  context: "The wider business picture",
  interpretation: "Our interpretation",
  counterCase: "The strongest case against our view",
  changeView: "What would change our view",
  position: "Our position",
} as const;

const imageBuilder = projectId ? createImageUrlBuilder({ projectId, dataset }) : null;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(value));
}

function ReportImageBlock({ value }: { value: ReportImage }) {
  if (!imageBuilder || !value.asset) return null;
  const src = imageBuilder.image(value).width(1400).fit("max").auto("format").url();
  return <figure>
    <Image src={src} alt={value.alt ?? ""} width={1400} height={900} sizes="(max-width: 760px) 100vw, 740px" />
    {value.caption && <figcaption>{value.caption}</figcaption>}
  </figure>;
}

function ResearchTableBlock({ value }: { value: ResearchTable }) {
  const columns = value.columns ?? [];
  const rows = value.rows ?? [];
  if (!columns.length) return null;
  return <div className="article-table-wrap">
    <table>
      {value.caption && <caption>{value.caption}</caption>}
      <thead><tr>{columns.map((column, index) => <th scope="col" key={`${column}-${index}`}>{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, rowIndex) => <tr key={row._key ?? rowIndex}>
        {columns.map((_, cellIndex) => <td key={cellIndex}>{row.cells?.[cellIndex] ?? ""}</td>)}
      </tr>)}</tbody>
    </table>
  </div>;
}

const portableTextComponents: PortableTextComponents = {
  block: {
    h3: ({ children }) => <h3>{children}</h3>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },
  marks: {
    link: ({ children, value }) => {
      const href = typeof value?.href === "string" ? value.href : "#";
      const external = /^https?:\/\//.test(href);
      return <a href={href} rel={external ? "noreferrer" : undefined}>{children}</a>;
    },
  },
  types: {
    image: ({ value }) => <ReportImageBlock value={value as ReportImage} />,
    researchTable: ({ value }) => <ResearchTableBlock value={value as ResearchTable} />,
  },
};

export function ResearchArticleView({ article }: { article: SanityReport }) {
  const sections = Object.entries(sectionLabels).flatMap(([key, label]) => {
    const content = article[key as keyof typeof sectionLabels];
    return Array.isArray(content) && content.length > 0 ? [{ key, label, content }] : [];
  });

  return <article className="research-article">
    <header className="article-header site-container">
      <Link className="article-back" href="/research">← Research</Link>
      <div className="article-kicker"><span>{article.ticker}</span><span>{article.category}</span></div>
      <h1>{article.company}: {article.title}</h1>
      <p className="article-summary">{article.summary}</p>
      <dl className="article-meta">
        <div><dt>Author</dt><dd>{article.author}</dd></div>
        <div><dt>Published</dt><dd><time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time></dd></div>
        <div><dt>Data cutoff</dt><dd><time dateTime={article.dataCutoff}>{formatDate(article.dataCutoff)}</time></dd></div>
        {article.updatedAt && <div><dt>Updated</dt><dd><time dateTime={article.updatedAt}>{formatDate(article.updatedAt)}</time></dd></div>}
      </dl>
      <div className="article-disclosures">
        <p><strong>Position disclosure:</strong> {article.positionDisclosure}</p>
        {article.otherInterests && <p><strong>Other relevant interests:</strong> {article.otherInterests}</p>}
      </div>
      {article.featuredImage && <ReportImageBlock value={article.featuredImage} />}
    </header>

    <div className="article-body reading-column">
      {sections.map(section => <section key={section.key}>
        <h2>{section.label}</h2>
        <PortableText value={section.content} components={portableTextComponents} />
      </section>)}
      <section>
        <h2>Sources</h2>
        {article.sources?.length ? <ol className="article-sources">{article.sources.map((source, index) => <li key={source._key ?? `${source.url}-${index}`}><a href={source.url} rel="noreferrer">{source.label}</a></li>)}</ol> : <p>No external sources are listed.</p>}
      </section>
      <section>
        <h2>Updates and corrections</h2>
        {article.updates?.length ? article.updates.map((update, index) => <p key={update._key ?? `${update.date}-${index}`}><strong>{formatDate(update.date)}</strong> — {update.text}</p>) : <p>No updates or corrections have been published.</p>}
      </section>
    </div>
  </article>;
}
