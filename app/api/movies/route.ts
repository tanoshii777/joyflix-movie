// app/api/movies/route.ts
import { NextResponse } from "next/server";
import connectDB from "@lib/db"; // ✅ default import
import Movie from "@models/Movie"; // ✅ default import for the model

// GET → fetch all movies
export async function GET() {
  await connectDB();

  try {
    const movies = await Movie.find();

    return NextResponse.json({
      success: true,
      movies,
    });
  } catch (err) {
    console.error("Error fetching movies:", err);
    return NextResponse.json(
      { success: false, message: "Error fetching movies" },
      { status: 500 }
    );
  }
}

// POST → add a new movie
export async function POST(req: Request) {
  await connectDB();

  try {
    const body = await req.json();

    const newMovie = new Movie({
      id: body.id, // Make sure you pass a unique id
      title: body.title,
      description: body.description,
      poster: body.poster,
      releaseDate: body.releaseDate,
      views: 0, // default new movie views
    });

    await newMovie.save();

    return NextResponse.json(
      { success: true, movie: newMovie },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error adding movie:", err);
    return NextResponse.json(
      { success: false, message: "Error adding movie" },
      { status: 500 }
    );
  }
}
