"use client"

import { useState } from "react"
import type { Photo } from "@/lib/types"
import { Lightbox } from "./lightbox"
import { ImageIcon } from "lucide-react"

export function PhotoGallery({
  initialPhotos,
  eventId,
}: {
  initialPhotos: Photo[]
  eventId: string
}) {
  const [photos] = useState<Photo[]>(initialPhotos)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <ImageIcon className="mb-4 h-12 w-12 text-zinc-700" />
        <p className="text-lg font-medium text-zinc-400">No photos yet</p>
        <p className="mt-1 text-sm text-zinc-600">
          Be the first to share a moment!
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => setSelectedIndex(index)}
            className="group relative aspect-square overflow-hidden rounded-lg bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <img
              src={`${supabaseUrl}/storage/v1/object/public/event-photos/${photo.storage_path}`}
              alt={`Photo by ${photo.uploader_name}`}
              className="h-full w-full animate-fade-in object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {/* Subtle overlay on hover */}
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <Lightbox
          photos={photos}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onNavigate={setSelectedIndex}
        />
      )}
    </>
  )
}
