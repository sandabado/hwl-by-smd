/**
 * Server-side launch gate for client-message writes.
 *
 * Reads stay available independently. Only the exact lowercase value `true`
 * enables the authenticated reply endpoint.
 */
export function isAdminConversationReplyReady(
  value = process.env.ADMIN_CLIENT_MESSAGING_READY
) {
  return value === "true"
}
