// app/hooks/useRatings.ts
import { useState, useEffect } from "react";

export function useRatings() {
  const [ratings, setRatings] = useState<{ [id: number]: number }>({});

  useEffect(() => {
    const stored = localStorage.getItem("ratings");
    if (stored) setRatings(JSON.parse(stored));
  }, []);

  const rateMovie = (id: number, value: number) => {
    const updated = { ...ratings, [id]: value };
    setRatings(updated);
    localStorage.setItem("ratings", JSON.stringify(updated));
  };

  return { ratings, rateMovie };
}
