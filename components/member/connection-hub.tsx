"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  ArrowRight,
  Check,
  Heart,
  Inbox,
  Loader2,
  MessageCircleHeart,
  Send,
} from "lucide-react"

import type {
  ConnectionConversation,
  ConnectionHubData,
} from "@/lib/connection-data"
import { cn } from "@/lib/utils"

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  month: "short",
})

function EmptyInbox() {
  return (
    <div className="den-card grid min-h-[30rem] place-items-center rounded-[2rem] p-8 text-center">
      <div className="max-w-sm">
        <Heart
          aria-hidden="true"
          className="mx-auto size-7 text-[var(--accent)]"
        />
        <h2 className="mt-5 text-4xl text-[var(--primary)]">
          Your first note is on its way.
        </h2>
        <p className="mt-4 leading-relaxed text-[var(--muted-foreground)]">
          When you join a guided series, Shannon&apos;s messages—and your
          replies—will live here. Every reply is read.
        </p>
      </div>
    </div>
  )
}

function ConversationThread({
  conversation,
  onReply,
}: {
  conversation: ConnectionConversation
  onReply: (message: ConnectionConversation["messages"][number]) => void
}) {
  const [reply, setReply] = useState("")
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle")

  useEffect(() => {
    void fetch("/api/conversations/read", {
      body: JSON.stringify({ conversationId: conversation.id }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    })
  }, [conversation.id])

  async function sendReply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const body = reply.trim()
    if (!body || status === "saving") return

    setStatus("saving")
    const response = await fetch("/api/conversations/reply", {
      body: JSON.stringify({
        body,
        conversationId: conversation.id,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    })

    if (!response.ok) {
      setStatus("error")
      return
    }

    const result = (await response.json()) as {
      message: ConnectionConversation["messages"][number]
    }
    onReply(result.message)
    setReply("")
    setStatus("idle")
  }

  return (
    <section
      aria-label={`${conversation.subject} conversation`}
      className="den-card flex min-h-[42rem] flex-col overflow-hidden rounded-[2rem]"
    >
      <header className="border-b border-[var(--border)] px-6 py-5 md:px-8">
        <p className="text-xs tracking-[0.22em] text-[var(--accent)] uppercase">
          Shannon · {conversation.subject}
        </p>
        <div className="mt-2 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <Check className="size-4" aria-hidden="true" />
          {conversation.progressLabel}
        </div>
      </header>

      <div
        aria-live="polite"
        className="flex-1 space-y-5 overflow-y-auto px-5 py-7 md:px-8"
      >
        {conversation.messages.map((message) => (
          <article
            className={cn(
              "group max-w-[88%] rounded-[1.5rem] px-5 py-4 md:max-w-[72%]",
              message.sender === "member"
                ? "ml-auto rounded-br-md bg-[var(--accent)] text-white"
                : "rounded-bl-md border border-[var(--border)] bg-white/65 text-[var(--primary)]"
            )}
            key={message.id}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.body}
            </p>
            {message.ctaHref ? (
              <Link
                className={cn(
                  "mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium",
                  message.sender === "member"
                    ? "bg-white text-[var(--primary)]"
                    : "bg-[var(--primary)] text-white"
                )}
                href={message.ctaHref}
              >
                {message.ctaLabel ?? "Continue"}
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            ) : null}
            <p
              className={cn(
                "mt-3 text-[10px] transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100",
                message.sender === "member"
                  ? "text-white/65"
                  : "text-[var(--muted-foreground)]"
              )}
            >
              {dateFormatter.format(new Date(message.sentAt))}
            </p>
          </article>
        ))}
      </div>

      <form
        className="border-t border-[var(--border)] bg-white/40 p-5 md:p-6"
        onSubmit={sendReply}
      >
        <label
          className="text-xs font-medium tracking-[0.18em] text-[var(--muted-foreground)] uppercase"
          htmlFor="connection-reply"
        >
          Reply to Shannon
        </label>
        <div className="mt-3 flex items-end gap-3">
          <textarea
            className="min-h-24 flex-1 resize-y rounded-[1.25rem] border border-[var(--border)] bg-white/75 px-4 py-3 text-sm leading-relaxed transition outline-none placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
            id="connection-reply"
            maxLength={4000}
            onChange={(event) => setReply(event.target.value)}
            placeholder="Tell Shannon what you're noticing…"
            value={reply}
          />
          <button
            aria-label="Send reply"
            className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--primary)] text-white transition hover:-translate-y-0.5 hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!reply.trim() || status === "saving"}
            type="submit"
          >
            {status === "saving" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted-foreground)]">
          <p>
            Shannon reads and responds personally, usually within 48 hours,
            Monday through Friday.
          </p>
          {status === "error" ? (
            <p className="text-red-700" role="alert">
              Your note could not be sent. Please try again.
            </p>
          ) : null}
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-[var(--muted-foreground)]">
          Messages are private between you and Shannon. They are not shared,
          sold, or used for marketing. This inbox is not monitored continuously
          and is not an emergency service. If you are experiencing a crisis,
          contact your local emergency service or a licensed professional in
          your area.
        </p>
        <p className="mt-2 text-[10px] leading-relaxed text-[var(--muted-foreground)]">
          Member messages may be automatically scanned for a small set of
          support-related terms solely to pause scheduled communication and
          alert Shannon. This ensures that if you&apos;re struggling, a
          person—not an automated system—responds.
        </p>
      </form>
    </section>
  )
}

export function ConnectionHub({
  canDownloadLift,
  initialData,
}: {
  canDownloadLift: boolean
  initialData: ConnectionHubData
}) {
  const [conversations, setConversations] = useState(initialData.conversations)
  const [activeId, setActiveId] = useState(
    initialData.conversations[0]?.id ?? ""
  )
  const active = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId),
    [activeId, conversations]
  )

  function addReply(
    conversationId: string,
    message: ConnectionConversation["messages"][number]
  ) {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              lastMessage: message.body,
              messages: [...conversation.messages, message],
              unreadCount: 0,
            }
          : conversation
      )
    )
  }

  if (!conversations.length) {
    return <EmptyInbox />
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.42fr_1fr_0.42fr]">
      <aside className="den-card h-fit rounded-[2rem] p-4">
        <div className="flex items-center gap-3 px-3 py-3">
          <Inbox className="size-5 text-[var(--accent)]" aria-hidden="true" />
          <h2 className="text-2xl text-[var(--primary)]">Conversations</h2>
        </div>
        <div className="mt-2 space-y-2">
          {conversations.map((conversation) => (
            <button
              className={cn(
                "w-full rounded-[1.25rem] p-4 text-left transition",
                activeId === conversation.id
                  ? "bg-[var(--primary)] text-white"
                  : "hover:bg-white/60"
              )}
              key={conversation.id}
              onClick={() => setActiveId(conversation.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium">{conversation.subject}</p>
                {conversation.unreadCount ? (
                  <span className="grid min-w-5 place-items-center rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-[10px] text-white">
                    {conversation.unreadCount}
                  </span>
                ) : null}
              </div>
              <p
                className={cn(
                  "mt-2 line-clamp-2 text-xs leading-relaxed",
                  activeId === conversation.id
                    ? "text-white/65"
                    : "text-[var(--muted-foreground)]"
                )}
              >
                {conversation.lastMessage}
              </p>
            </button>
          ))}
        </div>
      </aside>

      {active ? (
        <ConversationThread
          conversation={active}
          onReply={(message) => addReply(active.id, message)}
        />
      ) : null}

      <aside className="den-card h-fit rounded-[2rem] p-6">
        <p className="text-xs tracking-[0.2em] text-[var(--accent)] uppercase">
          Your circle
        </p>
        <h2 className="mt-3 text-3xl text-[var(--primary)]">
          Relationship context
        </h2>
        <dl className="mt-6 divide-y divide-[var(--border)] text-sm">
          <div className="py-4">
            <dt className="text-xs tracking-[0.16em] text-[var(--muted-foreground)] uppercase">
              Current focus
            </dt>
            <dd className="mt-2 leading-relaxed text-[var(--primary)]">
              Returning to ritual with consistency and ease.
            </dd>
          </div>
          <div className="py-4">
            <dt className="text-xs tracking-[0.16em] text-[var(--muted-foreground)] uppercase">
              Upcoming session
            </dt>
            <dd className="mt-2 text-[var(--primary)]">Nothing scheduled</dd>
          </div>
        </dl>
        <div className="mt-5 grid gap-2">
          <Link
            className="rounded-full bg-[var(--primary)] px-4 py-2.5 text-center text-xs font-medium text-white transition hover:bg-[var(--accent)]"
            href="/book"
          >
            Choose a private session
          </Link>
          {canDownloadLift ? (
            <Link
              className="rounded-full border border-[var(--border)] px-4 py-2.5 text-center text-xs font-medium text-[var(--primary)] transition hover:border-[var(--accent)]"
              href="/api/download/lift"
            >
              Download your guide
            </Link>
          ) : null}
          <Link
            className="rounded-full border border-[var(--border)] px-4 py-2.5 text-center text-xs font-medium text-[var(--primary)] transition hover:border-[var(--accent)]"
            href="/account/preferences/communication"
          >
            Booking invitations
          </Link>
        </div>
      </aside>

      {initialData.upcoming.length ? (
        <section className="den-card rounded-[2rem] p-6 md:p-8 xl:col-start-2">
          <div className="flex items-center gap-3">
            <MessageCircleHeart
              className="size-5 text-[var(--accent)]"
              aria-hidden="true"
            />
            <h2 className="text-3xl text-[var(--primary)]">Coming soon</h2>
          </div>
          <div className="mt-5 divide-y divide-[var(--border)]">
            {initialData.upcoming.map((journey) => (
              <div
                className="flex flex-wrap items-center justify-between gap-4 py-4"
                key={journey.id}
              >
                <div>
                  <p className="font-medium text-[var(--primary)]">
                    {journey.title}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Starts{" "}
                    {new Intl.DateTimeFormat("en-US", {
                      day: "numeric",
                      month: "long",
                    }).format(new Date(journey.startDate))}
                  </p>
                </div>
                <Link
                  className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-medium text-[var(--primary)] transition hover:border-[var(--accent)]"
                  href="/account/preferences"
                >
                  Manage opt-in
                </Link>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
