import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { ResearchArticleView } from "@/components/research-article";
import { SiteFooter } from "@/components/site-footer";
import { getReport } from "@/sanity/lib/data";

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<"/research/[slug]">) {
  const { slug } = await params;
  const article = await getReport(slug);
  return article
    ? { title: `${article.company}: ${article.title}`, description: article.summary }
    : { title: "Research not found" };
}

export default async function ResearchArticlePage({ params }: PageProps<"/research/[slug]">) {
  const { slug } = await params;
  const article = await getReport(slug);
  if (!article) notFound();

  return <>
    <Navbar />
    <main className="interior-main"><ResearchArticleView article={article} /></main>
    <SiteFooter />
  </>;
}
