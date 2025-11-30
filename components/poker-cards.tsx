"use client"

interface PokerCardsProps {
  cards: string[]
  selectedCard: string | null
  onSelectCard: (card: string) => void
  isDisabled: boolean
}

export function PokerCards({ cards, selectedCard, onSelectCard, isDisabled }: PokerCardsProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3" role="group" aria-label="Estimation cards">
      {cards.map((card) => (
        <button
          key={card}
          onClick={() => !isDisabled && onSelectCard(card)}
          disabled={isDisabled && card !== selectedCard}
          className={`aspect-square rounded-lg font-bold text-xl transition-all duration-200 border-2 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
            selectedCard === card
              ? "bg-accent border-accent text-accent-foreground scale-105 shadow-lg shadow-accent/50"
              : isDisabled
                ? "bg-muted border-muted text-muted-foreground cursor-not-allowed opacity-50"
                : "bg-secondary border-border text-foreground hover:border-accent hover:scale-105 cursor-pointer"
          }`}
          aria-pressed={selectedCard === card}
          aria-label={`Select ${card} as estimate`}
          aria-disabled={isDisabled && card !== selectedCard}
          type="button"
        >
          {card}
        </button>
      ))}
    </div>
  )
}
