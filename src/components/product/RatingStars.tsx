import { Star } from "lucide-react";

export default function RatingStars({
  rating,
  className = "",
}: {
  rating: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center ${className}`}
      aria-label={`${rating} / 5`}
      title={`${rating} / 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= Math.round(rating)
              ? "fill-orion-accent text-orion-accent"
              : "fill-gray-200 text-gray-300"
          }`}
        />
      ))}
    </span>
  );
}
