function getGridSize(difficulty) {
  switch(difficulty) {
    case 'easy': return 4;
    case 'medium': return 6;
    case 'hard': return 8;
    default: return 4;
  }
}

export default function Card({ card, onClick, difficulty }) {
  const cols = getGridSize(difficulty);

  const handleClick = () => {
    if (!card.isFlipped && !card.isMatched) {
      onClick(card.id);
    }
  };

  let cardClass = 'card';
  if (card.isFlipped || card.isMatched) {
    cardClass += ' flipped';
  }
  if (card.isMatched) {
    cardClass += ' matched';
  }

  return (
    <div
      className={`card-container`}
      style={{
        width: `calc(${100 / cols}% - 10px)`,
        paddingBottom: `calc(${100 / cols}% - 10px)`,
      }}
    >
      <div className={cardClass} onClick={handleClick}>
        <div className="card-inner">
          <div className="card-front">
            <span className="card-symbol">{card.symbol}</span>
          </div>
          <div className="card-back">
            <span className="card-question">?</span>
          </div>
        </div>
      </div>
    </div>
  );
}