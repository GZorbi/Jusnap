import Link from "next/link";
import { Camera, Sparkles, QrCode } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <main className="flex max-w-lg flex-col items-center gap-8 text-center">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <Camera className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Jusnap
          </h1>
        </div>

        {/* Tagline */}
        <p className="max-w-sm text-lg leading-relaxed text-zinc-400">
          Capture every moment. Guests scan, snap, and share — all photos in one
          beautiful live gallery.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300">
            <QrCode className="h-4 w-4" />
            QR Code Access
          </div>
          <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300">
            <Camera className="h-4 w-4" />
            Instant Uploads
          </div>
          <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300">
            <Sparkles className="h-4 w-4" />
            Live Gallery
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/auth"
            className="flex h-12 items-center justify-center rounded-full bg-white px-8 text-base font-semibold text-zinc-950 transition-colors hover:bg-zinc-200"
          >
            Get Started
          </Link>
          <Link
            href="/auth"
            className="flex h-12 items-center justify-center rounded-full border border-zinc-700 px-8 text-base font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
          >
            Organize an Event
          </Link>
        </div>

        {/* Subtle footer */}
        <p className="mt-4 text-xs text-zinc-600">
          No app download needed. Works on any phone.
        </p>
      </main>
    </div>
  );
}
