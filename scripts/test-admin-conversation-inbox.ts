import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

import {
  getAdminConversationInbox,
  getAdminConversationThread,
  type AdminConversationInboxDependencies,
} from "../lib/admin/conversation-inbox.ts"

const PRACTITIONER_ID = "2db86e10-4c97-45c3-a8b6-0ef074881091"
const MEMBER_ID = "ef49969e-133e-45ae-95c0-c31af90a4660"
const RELATIONSHIP_ID = "175ca5fe-288b-48dd-8e4e-5091944d5ba7"
const CONVERSATION_ID = "f82eb20e-9a08-4f4e-97f3-9fc5a80e49c8"
const MESSAGE_ID = "14b6db0d-833e-4407-b83f-d9795523a51a"

function dependencies(
  overrides: Partial<AdminConversationInboxDependencies> = {}
): AdminConversationInboxDependencies {
  return {
    readInbox: async () => ({
      conversationRows: [],
      count: 0,
      profileRows: [],
      relationshipRows: [],
      status: "ready",
    }),
    readThread: async () => ({ status: "not_found" }),
    requireAdmin: async () => ({
      email: "shannon@hwlbysmd.com",
      source: "supabase",
      userId: PRACTITIONER_ID,
    }),
    ...overrides,
  }
}

const profileRow = {
  email: "client@example.com",
  full_name: "HWL Client",
  id: MEMBER_ID,
}
const relationshipRow = {
  id: RELATIONSHIP_ID,
  member_id: MEMBER_ID,
  practitioner_id: PRACTITIONER_ID,
  status: "active",
}
const conversationRow = {
  created_at: "2026-09-08T17:00:00.000Z",
  id: CONVERSATION_ID,
  last_message: "Thank you, Shannon.",
  last_message_at: "2026-09-08T18:00:00.000Z",
  practitioner_unread_count: 1,
  relationship_id: RELATIONSHIP_ID,
  status: "awaiting_practitioner",
  subject: "Post-session reflection",
  type: "feedback",
}

test("local preview cannot trigger a service-role conversation read", async () => {
  let inboxReads = 0
  let threadReads = 0
  const localDependencies = dependencies({
    readInbox: async () => {
      inboxReads += 1
      return {
        conversationRows: [],
        count: 0,
        profileRows: [],
        relationshipRows: [],
        status: "ready",
      }
    },
    readThread: async () => {
      threadReads += 1
      return { status: "not_found" }
    },
    requireAdmin: async () => ({
      email: "local-preview",
      source: "local-preview",
      userId: null,
    }),
  })

  assert.deepEqual(await getAdminConversationInbox({}, localDependencies), {
    status: "local_preview",
  })
  assert.deepEqual(
    await getAdminConversationThread(CONVERSATION_ID, localDependencies),
    { status: "local_preview" }
  )
  assert.equal(inboxReads, 0)
  assert.equal(threadReads, 0)
})

test("inbox read is scoped to the signed-in practitioner and returns a minimal DTO", async () => {
  const result = await getAdminConversationInbox(
    { filter: "all", page: 2 },
    dependencies({
      readInbox: async (options) => {
        assert.deepEqual(options, {
          filter: "all",
          firstRow: 50,
          pageSize: 50,
          practitionerId: PRACTITIONER_ID,
        })
        return {
          conversationRows: [
            { ...conversationRow, internal_secret: "must-not-cross-dal" },
          ],
          count: 51,
          profileRows: [{ ...profileRow, is_admin: false }],
          relationshipRows: [
            { ...relationshipRow, notes: "private practitioner notes" },
          ],
          status: "ready",
        }
      },
    })
  )

  assert.equal(result.status, "ready")
  if (result.status !== "ready") return
  assert.equal(result.conversations.length, 1)
  assert.deepEqual(result.conversations[0], {
    clientEmail: "client@example.com",
    clientId: MEMBER_ID,
    clientName: "HWL Client",
    createdAt: "2026-09-08T17:00:00.000Z",
    id: CONVERSATION_ID,
    lastMessage: "Thank you, Shannon.",
    lastMessageAt: "2026-09-08T18:00:00.000Z",
    practitionerUnreadCount: 1,
    relationshipStatus: "active",
    status: "awaiting_practitioner",
    subject: "Post-session reflection",
    type: "feedback",
  })
  assert.equal("notes" in result.conversations[0], false)
  assert.equal("internal_secret" in result.conversations[0], false)
})

test("thread read validates practitioner scope and every message sender", async (t) => {
  const validThread = {
    conversationRow,
    messageCount: 1,
    messageRows: [
      {
        body: "Thank you, Shannon.",
        conversation_id: CONVERSATION_ID,
        cta_label: null,
        cta_link: null,
        id: MESSAGE_ID,
        read_at: null,
        sender_id: MEMBER_ID,
        sent_at: "2026-09-08T18:00:00.000Z",
      },
    ],
    profileRow,
    relationshipRow,
    status: "ready" as const,
  }

  await t.test("valid owned thread", async () => {
    const result = await getAdminConversationThread(
      CONVERSATION_ID,
      dependencies({
        readThread: async (options) => {
          assert.deepEqual(options, {
            conversationId: CONVERSATION_ID,
            practitionerId: PRACTITIONER_ID,
          })
          return validThread
        },
      })
    )

    assert.equal(result.status, "ready")
    if (result.status !== "ready") return
    assert.deepEqual(result.history, {
      isPartial: false,
      loadedCount: 1,
      totalCount: 1,
    })
    assert.equal(result.messages[0].sender, "client")
    assert.equal("senderId" in result.messages[0], false)
  })

  await t.test("relationship owned by another practitioner", async () => {
    const result = await getAdminConversationThread(
      CONVERSATION_ID,
      dependencies({
        readThread: async () => ({
          ...validThread,
          relationshipRow: {
            ...relationshipRow,
            practitioner_id: "40880d4e-d567-4cbf-8ce9-48758aeac2c4",
          },
        }),
      })
    )
    assert.deepEqual(result, { status: "unavailable" })
  })

  await t.test("message from a non-participant sender", async () => {
    const result = await getAdminConversationThread(
      CONVERSATION_ID,
      dependencies({
        readThread: async () => ({
          ...validThread,
          messageRows: [
            {
              ...validThread.messageRows[0],
              sender_id: "40880d4e-d567-4cbf-8ce9-48758aeac2c4",
            },
          ],
        }),
      })
    )
    assert.deepEqual(result, { status: "unavailable" })
  })
})

test("thread history returns the newest 500 messages in reading order and reports earlier history", async () => {
  const newestFirstRows = Array.from({ length: 500 }, (_, index) => ({
    body: `Message ${500 - index}`,
    conversation_id: CONVERSATION_ID,
    cta_label: null,
    cta_link: null,
    id: `message-${500 - index}`,
    read_at: null,
    sender_id: MEMBER_ID,
    sent_at: new Date(
      Date.parse("2026-09-08T18:00:00.000Z") - index * 60_000
    ).toISOString(),
  }))

  const result = await getAdminConversationThread(
    CONVERSATION_ID,
    dependencies({
      readThread: async () => ({
        conversationRow,
        messageCount: 642,
        messageRows: newestFirstRows,
        profileRow,
        relationshipRow,
        status: "ready",
      }),
    })
  )

  assert.equal(result.status, "ready")
  if (result.status !== "ready") return
  assert.deepEqual(result.history, {
    isPartial: true,
    loadedCount: 500,
    totalCount: 642,
  })
  assert.equal(result.messages.length, 500)
  assert.equal(result.messages[0].id, "message-1")
  assert.equal(result.messages.at(-1)?.id, "message-500")
})

test("runtime thread query requests an exact count and caps the newest messages", async () => {
  const source = await readFile(
    new URL("../lib/admin/conversation-inbox.ts", import.meta.url),
    "utf8"
  )
  const threadQuery = source.slice(
    source.indexOf('.from("conversation_messages")'),
    source.indexOf("const runtimeDependencies")
  )

  assert.match(threadQuery, /\{ count: "exact" \}/)
  assert.match(
    threadQuery,
    /\.order\("sent_at", \{ ascending: false \}\)[\s\S]*\.limit\(MAXIMUM_THREAD_MESSAGES\)/
  )
})

test("admin thread UI calls a capped result partial instead of complete", async () => {
  const source = await readFile(
    new URL("../app/admin/(protected)/messages/[id]/page.tsx", import.meta.url),
    "utf8"
  )

  assert.match(source, /Partial conversation history/)
  assert.match(source, /Earlier messages are not loaded in this view\./)
  assert.match(source, /Newest \$\{history\.loadedCount\}/)
})

test("invalid thread IDs fail before authorization or database access", async () => {
  let authorizationChecks = 0
  let reads = 0
  const result = await getAdminConversationThread(
    "not-a-conversation-id",
    dependencies({
      readThread: async () => {
        reads += 1
        return { status: "not_found" }
      },
      requireAdmin: async () => {
        authorizationChecks += 1
        return {
          email: "shannon@hwlbysmd.com",
          source: "supabase",
          userId: PRACTITIONER_ID,
        }
      },
    })
  )

  assert.deepEqual(result, { status: "invalid_id" })
  assert.equal(authorizationChecks, 0)
  assert.equal(reads, 0)
})
