import { Html, Head, Main, NextScript } from "next/document"

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Primary Meta Tags */}
        <meta name="title" content="Instant Scrum Poker - 100% Free Scrum Poker Planning Tool" />
        <meta name="description" content="100% free scrum poker tool for agile teams. No ads, no sign-ups, no credit card required. Simple planning poker tool for real-time story point estimation." />
        <meta name="keywords" content="scrum poker, planning poker, agile estimation, story points, sprint planning, agile tool, free scrum poker" />
        <meta name="author" content="Jon Tarrant" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://instantscrumpoker.com/" />
        <meta property="og:title" content="Instant Scrum Poker - 100% Free Scrum Poker Planning Tool" />
        <meta property="og:description" content="100% free scrum poker tool for agile teams. No ads, no sign-ups, no credit card required. Simple planning poker tool for real-time story point estimation." />
        <meta property="og:image" content="https://instantscrumpoker.com/logo2.png" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://instantscrumpoker.com/" />
        <meta property="twitter:title" content="Instant Scrum Poker - 100% Free Scrum Poker Planning Tool" />
        <meta property="twitter:description" content="100% free scrum poker tool for agile teams. No ads, no sign-ups, no credit card required. Simple planning poker tool for real-time story point estimation." />
        <meta property="twitter:image" content="https://instantscrumpoker.com/logo2.png" />
        
        {/* Favicon - SVG only for modern browsers */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        
        {/* Google tag (gtag.js) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-8RZFHW80LJ"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-8RZFHW80LJ');
            `,
          }}
        />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
