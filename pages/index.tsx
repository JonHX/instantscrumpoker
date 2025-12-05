import Head from "next/head"
import { LandingPage } from "@/components/landing-page"

export default function Home() {
  return (
    <>
      <Head>
        <title>Instant Scrum Poker - 100% Free Scrum Poker Planning Tool</title>
        <meta name="description" content="100% free scrum poker tool for agile teams. No ads, no sign-ups, no credit card required. Simple planning poker tool for real-time story point estimation." />
        <meta name="keywords" content="free scrum poker, planning poker, agile estimation, story points, sprint planning, free agile tool, scrum poker online, planning poker free" />
        <link rel="canonical" href="https://instantscrumpoker.com/" />
        <meta property="og:title" content="Instant Scrum Poker - 100% Free Scrum Poker Planning Tool" />
        <meta property="og:description" content="100% free scrum poker tool for agile teams. No ads, no sign-ups, no credit card required. Simple planning poker tool for real-time story point estimation." />
        <meta property="og:url" content="https://instantscrumpoker.com/" />
        <meta property="twitter:title" content="Instant Scrum Poker - 100% Free Scrum Poker Planning Tool" />
        <meta property="twitter:description" content="100% free scrum poker tool for agile teams. No ads, no sign-ups, no credit card required. Simple planning poker tool for real-time story point estimation." />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Instant Scrum Poker",
              "description": "100% free scrum poker tool for agile teams. No ads, no sign-ups, no credit card required. Simple planning poker tool for real-time story point estimation.",
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

