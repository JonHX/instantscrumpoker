import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Users, Target, MessageSquare, Eye, Repeat } from "lucide-react"

export default function WhatIsScrumPoker() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Nav />
      <main className="flex-1 px-4 py-12" role="main">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">What is Scrum Poker?</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A collaborative estimation technique for agile teams
            </p>
          </header>

          {/* Introduction */}
          <Card className="bg-card border-border p-8 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Introduction</h2>
            <p className="text-foreground leading-relaxed">
              <strong>Scrum Poker</strong> (also known as <strong>Planning Poker</strong>) is a consensus-based estimation technique 
              used by agile teams to estimate the effort required to complete user stories or tasks. It helps teams reach agreement 
              on story points or time estimates through discussion and collaboration.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The technique was created by James Grenning in 2002 and popularized by Mike Cohn. It's based on the Wideband Delphi 
              method and uses a deck of cards with numbers representing estimates.
            </p>
          </Card>

          {/* Video Tutorial */}
          <Card className="bg-card border-border p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Watch a Tutorial</h2>
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                src="https://www.youtube.com/embed/MZoO8-Q46vY"
                title="Scrum Poker / Planning Poker Tutorial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Video: Planning Poker explained by Atlassian
            </p>
          </Card>

          {/* Step-by-Step Guide */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground text-center">How to Play Scrum Poker</h2>
            
            {/* Step 1 */}
            <Card className="bg-card border-border p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-accent-foreground">1</span>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-accent" />
                    <h3 className="text-2xl font-bold text-foreground">Create a Room & Gather Your Team</h3>
                  </div>
                  <p className="text-foreground leading-relaxed">
                    Start by creating an estimation room and sharing the room code with your team members. 
                    Everyone joins the same room so they can participate in the estimation session together.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    <strong>Tip:</strong> Make sure all team members who will be working on the story are present. 
                    This includes developers, designers, QA, and anyone else who understands the work involved.
                  </p>
                </div>
              </div>
            </Card>

            {/* Step 2 */}
            <Card className="bg-card border-border p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-accent-foreground">2</span>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Target className="w-6 h-6 text-accent" />
                    <h3 className="text-2xl font-bold text-foreground">Present the User Story</h3>
                  </div>
                  <p className="text-foreground leading-relaxed">
                    The product owner or scrum master presents the user story or task to be estimated. 
                    Make sure everyone understands what needs to be built, including acceptance criteria, 
                    dependencies, and any technical considerations.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    <strong>Important:</strong> Clarify any questions before voting begins. 
                    Ambiguity leads to inconsistent estimates.
                  </p>
                </div>
              </div>
            </Card>

            {/* Step 3 */}
            <Card className="bg-card border-border p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-accent-foreground">3</span>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-accent" />
                    <h3 className="text-2xl font-bold text-foreground">Select Your Estimate Privately</h3>
                  </div>
                  <p className="text-foreground leading-relaxed">
                    Each team member privately selects a card representing their estimate. 
                    Use the Fibonacci sequence (1, 2, 3, 5, 8, 13, 21, 34) or similar scale. 
                    The "?" card can be used if you need clarification.
                  </p>
                  <div className="bg-secondary rounded-lg p-4 mt-4">
                    <p className="text-sm font-semibold text-foreground mb-2">Why Fibonacci?</p>
                    <p className="text-sm text-muted-foreground">
                      The Fibonacci sequence reflects the uncertainty in estimation. The larger the number, 
                      the more uncertainty exists. This prevents false precision and encourages discussion 
                      when estimates differ significantly.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Step 4 */}
            <Card className="bg-card border-border p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-accent-foreground">4</span>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Eye className="w-6 h-6 text-accent" />
                    <h3 className="text-2xl font-bold text-foreground">Reveal All Votes Simultaneously</h3>
                  </div>
                  <p className="text-foreground leading-relaxed">
                    Once everyone has voted, reveal all estimates at the same time. This prevents 
                    anchoring bias where later voters are influenced by seeing earlier votes.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    <strong>Key benefit:</strong> Simultaneous revelation ensures independent thinking 
                    and honest estimates from all team members.
                  </p>
                </div>
              </div>
            </Card>

            {/* Step 5 */}
            <Card className="bg-card border-border p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-accent-foreground">5</span>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-accent" />
                    <h3 className="text-2xl font-bold text-foreground">Discuss Differences</h3>
                  </div>
                  <p className="text-foreground leading-relaxed">
                    If estimates differ significantly, team members discuss their reasoning. 
                    The person with the highest estimate explains why they think it's complex, 
                    and the person with the lowest estimate explains why they think it's simple.
                  </p>
                  <div className="bg-secondary rounded-lg p-4 mt-4">
                    <p className="text-sm font-semibold text-foreground mb-2">What to discuss:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Technical complexity or unknowns</li>
                      <li>Dependencies on other work</li>
                      <li>Assumptions about requirements</li>
                      <li>Past experience with similar tasks</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            {/* Step 6 */}
            <Card className="bg-card border-border p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-accent-foreground">6</span>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Repeat className="w-6 h-6 text-accent" />
                    <h3 className="text-2xl font-bold text-foreground">Re-estimate Until Consensus</h3>
                  </div>
                  <p className="text-foreground leading-relaxed">
                    After discussion, team members vote again. Repeat this process until the team 
                    reaches consensus or agrees on a final estimate. Usually, 2-3 rounds are enough.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    <strong>Consensus doesn't mean everyone agrees:</strong> It means everyone can 
                    accept the estimate and commit to it. If estimates are close (e.g., 5 and 8), 
                    you might average them or take the higher value.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Best Practices */}
          <Card className="bg-card border-border p-8 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Best Practices</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">✓ Keep Stories Small</h3>
                <p className="text-muted-foreground text-sm">
                  Break down large stories before estimating. If a story is estimated at 21 or 34, 
                  it's probably too big and should be split.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">✓ Use Relative Estimation</h3>
                <p className="text-muted-foreground text-sm">
                  Compare stories to each other, not to absolute time. A "5" should be roughly 
                  twice as complex as a "3", regardless of actual hours.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">✓ Include the Whole Team</h3>
                <p className="text-muted-foreground text-sm">
                  Everyone who will work on the story should participate. Different perspectives 
                  lead to better estimates.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">✓ Timebox the Discussion</h3>
                <p className="text-muted-foreground text-sm">
                  If discussion goes on too long, take a break or defer the story. 
                  Use a timer to keep discussions focused and productive.
                </p>
              </div>
            </div>
          </Card>

          {/* Benefits */}
          <Card className="bg-card border-border p-8 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Benefits of Scrum Poker</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">🎯 Better Estimates</h3>
                <p className="text-sm text-muted-foreground">
                  Multiple perspectives lead to more accurate estimates than individual guesses.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">💬 Team Alignment</h3>
                <p className="text-sm text-muted-foreground">
                  Discussion ensures everyone understands the work and its complexity.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">⚡ Faster Planning</h3>
                <p className="text-sm text-muted-foreground">
                  Structured process prevents endless debates and keeps planning sessions focused.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">📊 Shared Understanding</h3>
                <p className="text-sm text-muted-foreground">
                  Team members learn from each other's perspectives and reasoning.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

