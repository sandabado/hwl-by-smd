import { SeoArticlePage } from "@/components/journal/seo-article-page"
import { seoJournalArticles } from "@/lib/seo-journal-articles"
import { createPageMetadata } from "@/lib/seo"

const article = seoJournalArticles["sound-bath-joshua-tree"]

export const metadata = createPageMetadata({
  ...article.metadata,
  path: `/journal/${article.slug}`,
})

export default function SoundBathJoshuaTreeArticle() {
  return <SeoArticlePage article={article} />
}
