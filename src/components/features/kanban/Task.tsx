import type { Card } from "@/types/domain";

type TaskProps = {
  card: Card;
};

export function Task({ card }: TaskProps) {
  return (
    <div className="rounded-md border bg-background p-2 text-sm shadow-sm">
      <p className="font-medium">{card.title}</p>
      {card.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
          {card.description}
        </p>
      )}
    </div>
  );
}