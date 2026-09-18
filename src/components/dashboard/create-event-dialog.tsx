"use client"

import { useState, useTransition } from "react"
import { createEvent } from "@/app/dashboard/actions"
import { Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function CreateEventDialog() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [isCustomSlug, setIsCustomSlug] = useState(false)

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  function handleTitleChange(val: string) {
    setTitle(val)
    if (!isCustomSlug) {
      setSlug(generateSlug(val))
    }
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    // Guarantee slug is attached
    if (!formData.get("slug")) {
      formData.set("slug", slug || generateSlug(title))
    }

    startTransition(async () => {
      try {
        console.log("[CreateEventDialog] Submitting event creation form...")
        const result = await createEvent(formData)
        console.log("[CreateEventDialog] Result:", result)

        if (result?.error) {
          setError(result.error)
        } else {
          setOpen(false)
          setTitle("")
          setSlug("")
          setIsCustomSlug(false)
          setError(null)
        }
      } catch (err: any) {
        console.error("[CreateEventDialog] Error submitting form:", err)
        setError(err?.message || "Failed to submit event form")
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null)
          setOpen(true)
        }}
        className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200"
      >
        <Plus className="h-4 w-4" />
        Create Event
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Dialog */}
          <div className="relative w-full max-w-md animate-fade-in-scale rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 text-zinc-500 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-6 text-xl font-bold text-white">Create New Event</h2>

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-sm text-zinc-400">Event Title</label>
                <input
                  name="title"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Sarah & Tom's Wedding"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm text-zinc-400">URL Slug</label>
                  {!isCustomSlug && (
                    <button
                      type="button"
                      onClick={() => setIsCustomSlug(true)}
                      className="text-xs text-zinc-500 hover:text-zinc-300"
                    >
                      Edit slug
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-500">/e/</span>
                  <input
                    name="slug"
                    required
                    value={slug}
                    onChange={(e) => {
                      setIsCustomSlug(true)
                      setSlug(generateSlug(e.target.value))
                    }}
                    readOnly={!isCustomSlug}
                    className={cn(
                      "w-full rounded-xl border border-zinc-700 px-4 py-3 text-white focus:outline-none focus:border-zinc-500",
                      isCustomSlug ? "bg-zinc-800" : "bg-zinc-800/50 text-zinc-400"
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm text-zinc-400">Start</label>
                  <input
                    name="startTime"
                    type="datetime-local"
                    required
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white focus:border-zinc-500 focus:outline-none [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-zinc-400">End</label>
                  <input
                    name="endTime"
                    type="datetime-local"
                    required
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white focus:border-zinc-500 focus:outline-none [color-scheme:dark]"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="mt-2 flex h-12 items-center justify-center rounded-full bg-white text-base font-semibold text-zinc-950 transition-colors hover:bg-zinc-200 disabled:opacity-50"
              >
                {isPending ? "Creating..." : "Create Event"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
