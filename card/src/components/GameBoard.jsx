import Card from './Card';

export default function GameBoard({ cards, onCardClick, difficulty }) {
  const cols = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;

  return (
    <div className="game-board" style={{ maxWidth: `${cols * 90}px` }}>
      {cards.map((card) => (
        <Card
          key={card.id}
          card={card}
          onClick={onCardClick}
          difficulty={difficulty}
        />
      ))}
    </div>
  );
}