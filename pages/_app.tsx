import "@/styles/globals.css"
import type { AppProps } from "next/app"
import { useEffect } from "react"
import Head from "next/head"
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
    <>
      <Head>
        <title>Instant Scrum Poker - Free Instant Planning Poker Tool</title>
        <meta
          name="description"
          content="Free, instant planning poker for agile teams. No ads, no sign-ups. Estimate user stories together in real time with zero friction."
        />
        <link rel="canonical" href="https://instantscrumpoker.com/" />
      </Head>
      <div className={inter.variable}>
        <Component {...pageProps} />
      </div>
    </>
  )
}

