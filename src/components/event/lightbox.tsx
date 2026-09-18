"use client"

import { useEffect, useCallback } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import type { Photo } from "@/lib/types"

export function Lightbox({
  photos,
  currentIndex,
  onClose,
  onNavigate,
}: {
  photos: Photo[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}) {
  const photo = photos[currentIndex]
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  const goNext = useCallback(() => {
    if (currentIndex < photos.length - 1) onNavigate(currentIndex + 1)
  }, [currentIndex, photos.length, onNavigate])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) onNavigate(currentIndex - 1)
  }, [currentIndex, onNavigate])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") goNext()
      if (e.key === "ArrowLeft") goPrev()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose, goNext, goPrev])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  const timestamp = new Date(photo.created_at).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-zinc-800/80 p-2 text-zinc-400 hover:text-white"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Navigation */}
      {currentIndex > 0 && (
        <button
          onClick={goPrev}
          className="absolute left-2 z-10 rounded-full bg-zinc-800/80 p-2 text-zinc-400 hover:text-white sm:left-4"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      {currentIndex < photos.length - 1 && (
        <button
          onClick={goNext}
          className="absolute right-2 z-10 rounded-full bg-zinc-800/80 p-2 text-zinc-400 hover:text-white sm:right-4"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Image */}
      <div className="relative z-0 flex max-h-[85vh] max-w-[90vw] flex-col items-center">
        <img
          src={`${supabaseUrl}/storage/v1/object/public/event-photos/${photo.storage_path}`}
          alt={`Photo by ${photo.uploader_name}`}
          className="max-h-[80vh] rounded-lg object-contain animate-fade-in-scale"
        />
        {/* Info bar */}
        <div className="mt-3 flex items-center gap-3 text-sm">
          <span className="text-zinc-300">{photo.uploader_name}</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-500">{timestamp}</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-600">
            {currentIndex + 1} / {photos.length}
          </span>
        </div>
      </div>
    </div>
  )
}
