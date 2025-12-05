import Head from "next/head"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Zap, Heart, Shield, Sparkles } from "lucide-react"

export default function About() {
  return (
    <>
      <Head>
        <title>About - Instant Scrum Poker | Free, Instant Planning Poker</title>
        <meta
          name="description"
          content="Learn about Instant Scrum Poker - a free, ad-free planning poker tool built for agile teams. No sign-ups, no credit cards, no catch."
        />
        <meta name="keywords" content="free scrum poker, about scrum poker tool, free agile tool, planning poker free, instant planning poker" />
        <link rel="canonical" href="https://instantscrumpoker.com/about" />
        <meta property="og:title" content="About - Instant Scrum Poker | Free, Instant Planning Poker" />
        <meta
          property="og:description"
          content="Learn about Instant Scrum Poker - a free, ad-free planning poker tool built for agile teams. No sign-ups, no credit cards, no catch."
        />
        <meta property="og:url" content="https://instantscrumpoker.com/about" />
        <meta property="twitter:title" content="About - Instant Scrum Poker | Free, Instant Planning Poker" />
        <meta
          property="twitter:description"
          content="Learn about Instant Scrum Poker - a free, ad-free planning poker tool built for agile teams. No sign-ups, no credit cards, no catch."
        />
      </Head>
      <div className="min-h-screen bg-background flex flex-col">
        <Nav />
      <main className="flex-1 px-4 py-12" role="main">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                <Zap className="w-7 h-7 text-accent-foreground" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">About InstantScrumPoker</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A free, simple, and ad-free scrum poker tool that just works
            </p>
          </header>

          <Card className="bg-card border-border p-8 space-y-6">
            <div className="space-y-4">
              <p className="text-foreground text-lg leading-relaxed">
                We built <strong className="text-accent">InstantScrumPoker</strong> because we were frustrated with existing scrum poker tools. 
                They were either cluttered with ads, required sign-ups, or were overly complicated.
              </p>
              
              <p className="text-foreground leading-relaxed">
                Our mission is simple: <strong>create a free forever scrum poker tool that just works</strong>. 
                No ads. No sign-ups. No complexity. Just a clean, fast, and reliable way for your team to estimate stories together.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-6 border-t border-border">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
                  <Heart className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground">Free Forever</h3>
                <p className="text-sm text-muted-foreground">No hidden costs, no premium tiers, no catch</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground">No Ads</h3>
                <p className="text-sm text-muted-foreground">A clean, distraction-free experience</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground">Simple & Fast</h3>
                <p className="text-sm text-muted-foreground">Get started in seconds, no configuration needed</p>
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">Why We Built This</h2>
              <p className="text-muted-foreground leading-relaxed">
                As a software engineer who has led multiple teams, I needed a tool that our distributed teams could use instantly without friction. 
                We wanted something that focused on the core experience: creating a room, voting, and reaching consensus. 
                That's it. No bells, no whistles, no distractions.
              </p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
      </div>
    </>
  )
}

