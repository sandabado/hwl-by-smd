/**
 * Public, non-secret launch gate for website inquiry collection.
 *
 * NEXT_PUBLIC_ values are fixed when Next.js builds the application. Only the
 * exact lowercase value `true` opens collection; every other value fails closed.
 */
export function isInquiryCollectionReady(
  value = process.env.NEXT_PUBLIC_INQUIRY_COLLECTION_READY
) {
  return value === "true"
}
