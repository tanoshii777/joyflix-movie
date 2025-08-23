"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Filter, X, SlidersHorizontal } from "lucide-react"
import { movies } from "@/app/moviesData"
import MovieCard from "@/app/components/MovieCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SearchFilters {
  query: string
  categories: string[]
  yearRange: { min: number; max: number }
  sortBy: "title" | "year" | "category"
  sortOrder: "asc" | "desc"
}

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<any>(null)

  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get("q") || "",
    categories: [],
    yearRange: { min: 1990, max: 2024 },
    sortBy: "title",
    sortOrder: "asc",
  })

  // Get unique categories and year range from movies data
  const availableCategories = [...new Set(movies.map((movie) => movie.category))].sort()
  const movieYears = movies.map((movie) => movie.year).filter(Boolean)
  const minYear = Math.min(...movieYears)
  const maxYear = Math.max(...movieYears)

  // Filter and sort movies based on current filters
  const filteredMovies = movies
    .filter((movie) => {
      // Text search
      if (filters.query && !movie.title.toLowerCase().includes(filters.query.toLowerCase())) {
        return false
      }

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(movie.category)) {
        return false
      }

      // Year range filter
      if (movie.year && (movie.year < filters.yearRange.min || movie.year > filters.yearRange.max)) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      let comparison = 0

      switch (filters.sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        case "year":
          comparison = (a.year || 0) - (b.year || 0)
          break
        case "category":
          comparison = a.category.localeCompare(b.category)
          break
      }

      return filters.sortOrder === "desc" ? -comparison : comparison
    })

  const handleMovieSelect = (movie: any) => {
    setSelectedMovie(movie)
    router.push(`/watch/${movie.id}`)
  }

  const handleCategoryToggle = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }))
  }

  const clearFilters = () => {
    setFilters({
      query: "",
      categories: [],
      yearRange: { min: minYear, max: maxYear },
      sortBy: "title",
      sortOrder: "asc",
    })
  }

  const activeFiltersCount =
    (filters.categories.length > 0 ? 1 : 0) +
    (filters.yearRange.min !== minYear || filters.yearRange.max !== maxYear ? 1 : 0)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Search className="text-primary" size={32} />
          <h1 className="text-3xl md:text-4xl font-bold">Advanced Search</h1>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" size={20} />
          <Input
            type="text"
            placeholder="Search movies by title..."
            value={filters.query}
            onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
            className="pl-10 h-12 text-lg bg-card border-border"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <SlidersHorizontal size={20} />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
                  <Filter size={16} />
                </Button>
              </CardHeader>
              <CardContent className={`space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
                {/* Categories Filter */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Categories</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableCategories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={filters.categories.includes(category)}
                          onCheckedChange={() => handleCategoryToggle(category)}
                        />
                        <Label htmlFor={category} className="text-sm cursor-pointer">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Year Range Filter */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Year Range</Label>
                  <div className="flex gap-2">
                    <Select
                      value={filters.yearRange.min.toString()}
                      onValueChange={(value) =>
                        setFilters((prev) => ({
                          ...prev,
                          yearRange: { ...prev.yearRange, min: Number.parseInt(value) },
                        }))
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i).map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-muted self-center">to</span>
                    <Select
                      value={filters.yearRange.max.toString()}
                      onValueChange={(value) =>
                        setFilters((prev) => ({
                          ...prev,
                          yearRange: { ...prev.yearRange, max: Number.parseInt(value) },
                        }))
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i).map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Sort By</Label>
                  <div className="space-y-2">
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value: "title" | "year" | "category") =>
                        setFilters((prev) => ({ ...prev, sortBy: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="year">Year</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={filters.sortOrder}
                      onValueChange={(value: "asc" | "desc") => setFilters((prev) => ({ ...prev, sortOrder: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full bg-transparent"
                  disabled={activeFiltersCount === 0 && !filters.query}
                >
                  <X size={16} className="mr-2" />
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="flex-1">
            <div className="mb-6">
              <p className="text-muted">
                {filteredMovies.length} movie{filteredMovies.length !== 1 ? "s" : ""} found
                {filters.query && ` for "${filters.query}"`}
              </p>
            </div>

            {filteredMovies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {filteredMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} onSelect={handleMovieSelect} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Search className="mx-auto text-muted mb-4" size={48} />
                <h2 className="text-xl font-semibold mb-2">No movies found</h2>
                <p className="text-muted mb-4">Try adjusting your search criteria or clearing some filters</p>
                <Button onClick={clearFilters} variant="outline">
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
