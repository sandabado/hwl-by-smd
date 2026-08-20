import { SeoArticlePage } from "@/components/journal/seo-article-page"
import { seoJournalArticles } from "@/lib/seo-journal-articles"
import { createPageMetadata } from "@/lib/seo"

const article = seoJournalArticles["desert-skincare"]

export const metadata = createPageMetadata({
  ...article.metadata,
  path: `/journal/${article.slug}`,
})

export default function DesertSkincareArticle() {
  return <SeoArticlePage article={article} />
}
