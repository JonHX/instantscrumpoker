import Head from "next/head"
import { LandingPage } from "@/components/landing-page"

export default function Home() {
  return (
    <>
      <Head>
        <title>Instant Scrum Poker - Free Instant Planning Poker Tool</title>
        <meta
          name="description"
          content="Free, instant planning poker for agile teams. No ads, no sign-ups. Estimate user stories together in real time with zero friction."
        />
        <meta name="keywords" content="free scrum poker, planning poker, agile estimation, story points, sprint planning, free agile tool, scrum poker online, planning poker free" />
        <link rel="canonical" href="https://instantscrumpoker.com/" />
        <meta property="og:title" content="Instant Scrum Poker - Free Instant Planning Poker Tool" />
        <meta
          property="og:description"
          content="Free, instant planning poker for agile teams. No ads, no sign-ups. Estimate user stories together in real time with zero friction."
        />
        <meta property="og:url" content="https://instantscrumpoker.com/" />
        <meta property="twitter:title" content="Instant Scrum Poker - Free Instant Planning Poker Tool" />
        <meta
          property="twitter:description"
          content="Free, instant planning poker for agile teams. No ads, no sign-ups. Estimate user stories together in real time with zero friction."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Instant Scrum Poker",
              "description": "Free, instant planning poker for agile teams. No ads, no sign-ups. Estimate user stories together in real time with zero friction.",
              "url": "https://instantscrumpoker.com",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "100% Free Forever",
                "No Ads",
                "No Sign-ups Required",
                "Real-time Collaboration",
                "Unlimited Participants",
                "Instant Setup"
              ],
              "author": {
                "@type": "Person",
                "name": "Jon Tarrant",
                "url": "https://jontarrant.me"
              }
            })
          }}
        />
      </Head>
      <LandingPage />
    </>
  )
}

