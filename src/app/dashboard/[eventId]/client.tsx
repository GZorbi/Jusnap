"use client"

import { useState, useTransition } from "react"
import { QRCodeSVG } from "qrcode.react"
import { deletePhoto, addMember } from "@/app/dashboard/actions"
import { Trash2, UserPlus, QrCode, Download, ImageIcon } from "lucide-react"
import type { Event, Photo, EventMember } from "@/lib/types"

export function EventDetailClient({
  event,
  photos,
  members,
}: {
  event: Event
  photos: Photo[]
  members: EventMember[]
}) {
  const [showQR, setShowQR] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [memberEmail, setMemberEmail] = useState("")
  const [memberRole, setMemberRole] = useState("admin")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const eventUrl = typeof window !== "undefined"
    ? `${window.location.origin}/e/${event.slug}`
    : `/e/${event.slug}`

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  function handleDeletePhoto(photo: Photo) {
    if (!confirm("Delete this photo?")) return
    startTransition(async () => {
      const result = await deletePhoto(photo.id, photo.storage_path, event.id)
      if (result?.error) setError(result.error)
    })
  }

  function handleAddMember() {
    if (!memberEmail) return
    setError(null)
    startTransition(async () => {
      const result = await addMember(event.id, memberEmail, memberRole)
      if (result?.error) {
        setError(result.error)
      } else {
        setMemberEmail("")
        setShowAddMember(false)
      }
    })
  }

  function downloadQR() {
    const svg = document.querySelector("#qr-code-svg") as SVGElement
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext("2d")!
    const img = new Image()
    img.onload = () => {
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, 512, 512)
      ctx.drawImage(img, 56, 56, 400, 400)
      // Add text
      ctx.fillStyle = "black"
      ctx.font = "bold 24px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(event.title, 256, 490)
      const a = document.createElement("a")
      a.download = `${event.slug}-qr.png`
      a.href = canvas.toDataURL("image/png")
      a.click()
    }
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      {/* Action Buttons */}
      <div className="mb-8 flex flex-wrap gap-3">
        <button
          onClick={() => setShowQR(!showQR)}
          className="flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
        >
          <QrCode className="h-4 w-4" />
          QR Code
        </button>
        <button
          onClick={() => setShowAddMember(!showAddMember)}
          className="flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
        >
          <UserPlus className="h-4 w-4" />
          Add Member
        </button>
        <a
          href={`/e/${event.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
        >
          <ImageIcon className="h-4 w-4" />
          View Guest Gallery
        </a>
      </div>

      {/* QR Code Section */}
      {showQR && (
        <div className="mb-8 animate-fade-in rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-2xl bg-white p-4">
              <QRCodeSVG id="qr-code-svg" value={eventUrl} size={200} />
            </div>
            <p className="text-sm text-zinc-400">{eventUrl}</p>
            <button
              onClick={downloadQR}
              className="flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-200"
            >
              <Download className="h-4 w-4" />
              Download QR Code
            </button>
          </div>
        </div>
      )}

      {/* Add Member Section */}
      {showAddMember && (
        <div className="mb-8 animate-fade-in rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Add Team Member</h3>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="member@example.com"
              className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
            />
            <select
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value)}
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white focus:outline-none"
            >
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
            <button
              onClick={handleAddMember}
              disabled={isPending}
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-50"
            >
              {isPending ? "Adding..." : "Add"}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

          {/* Current Members */}
          {members.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-zinc-400">Current members:</p>
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg bg-zinc-800 px-3 py-2">
                  <span className="text-sm text-zinc-300">{m.user_id}</span>
                  <span className="rounded-full bg-zinc-700 px-2 py-0.5 text-xs text-zinc-400">{m.role}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Photo Gallery with Moderation */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">
          Photos ({photos.length})
        </h3>
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 py-16">
            <ImageIcon className="mb-3 h-10 w-10 text-zinc-700" />
            <p className="text-zinc-400">No photos uploaded yet</p>
            <p className="mt-1 text-sm text-zinc-600">Share the QR code with your guests</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => (
              <div key={photo.id} className="group relative">
                <div className="aspect-square overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                  <img
                    src={`${supabaseUrl}/storage/v1/object/public/event-photos/${photo.storage_path}`}
                    alt={`Photo by ${photo.uploader_name}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 flex items-end rounded-xl bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex w-full items-center justify-between p-3">
                    <span className="text-xs text-white">{photo.uploader_name}</span>
                    <button
                      onClick={() => handleDeletePhoto(photo)}
                      disabled={isPending}
                      className="rounded-full bg-red-500/80 p-1.5 text-white hover:bg-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
