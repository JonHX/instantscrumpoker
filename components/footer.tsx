"use client"

export function Footer() {
  return (
    <div className="pt-8 pb-4">
      <p className="text-xs text-muted-foreground flex items-center justify-center gap-2 flex-wrap">
        <span>Made with</span>
        <span className="text-red-500 animate-pulse" aria-label="love">❤️</span>
        <span>by</span>
        <a
          href="https://jontarrant.me"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground hover:text-accent transition-colors hover:underline focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded px-1"
          aria-label="Visit Jon Tarrant's website"
        >
          Jon Tarrant
        </a>
        <span>•</span>
        <a
          href="https://buymeacoffee.com/jontarrant"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-accent hover:text-accent/80 transition-colors font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded px-1"
          aria-label="Support this project on Buy Me a Coffee"
        >
          <span>☕</span>
          <span>Buy Me a Coffee</span>
        </a>
      </p>
    </div>
  )
}

