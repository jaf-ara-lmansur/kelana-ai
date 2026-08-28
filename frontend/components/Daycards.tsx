import type { ReactNode } from "react";

type DayCard = {
  label: string;
  value: ReactNode;
};

export default function Daycards({ cards }: { cards: DayCard[] }) {
  return (
    <dl className="detail-stats">
      {cards.map((card) => (
        <div key={card.label}>
          <dt>{card.label}</dt>
          <dd>{card.value}</dd>
        </div>
      ))}
    </dl>
  );
}
