// lib/tmdb.ts
export async function fetchTMDBMovies(
  category: string = "popular",
  page: number = 1
) {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${category}?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=${page}`,
      { next: { revalidate: 3600 } } // cache for 1 hour
    );

    if (!res.ok) throw new Error("Failed to fetch TMDB movies");

    const data = await res.json();

    return data.results.map((movie: any) => ({
      id: `tmdb-${movie.id}`,
      title: movie.title,
      year: movie.release_date ? movie.release_date.split("-")[0] : "N/A",
      thumbnail: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
    }));
  } catch (err) {
    console.error("TMDB Fetch Error:", err);
    return [];
  }
}
