"use client"

import { useState } from "react"
import { Star } from "lucide-react"

interface StarRatingProps {
  rating: number
  onRatingChange?: (rating: number) => void
  readonly?: boolean
  size?: "sm" | "md" | "lg"
  showValue?: boolean
  maxRating?: number
}

export default function StarRating({
  rating,
  onRatingChange,
  readonly = false,
  size = "md",
  showValue = false,
  maxRating = 10,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value)
    }
  }

  const handleMouseEnter = (value: number) => {
    if (!readonly) {
      setHoverRating(value)
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0)
    }
  }

  const displayRating = hoverRating || rating

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1
          const isFilled = starValue <= displayRating

          return (
            <button
              key={index}
              type="button"
              disabled={readonly}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              className={`
                transition-all duration-200 
                ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}
                ${isFilled ? "text-yellow-400" : "text-gray-400"}
                ${!readonly && "hover:text-yellow-300"}
              `}
            >
              <Star className={`${sizeClasses[size]} ${isFilled ? "fill-current" : ""}`} />
            </button>
          )
        })}
      </div>

      {showValue && (
        <span className="text-sm text-gray-400 ml-2">{displayRating > 0 ? `${displayRating}/10` : "Not rated"}</span>
      )}
    </div>
  )
}
