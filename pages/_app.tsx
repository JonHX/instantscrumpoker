import "@/styles/globals.css"
import type { AppProps } from "next/app"
import { useEffect } from "react"
import { Inter } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
})

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Apply saved theme on mount (client-side only)
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme")
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark")
      }
    }
  }, [])

  return (
    <div className={inter.variable}>
      <Component {...pageProps} />
    </div>
  )
}

