import { NextResponse } from "next/server";
import dbConnect from "@/lib/db"; // ✅ correct import
import Movie from "@/models/Movie";

// GET → get movie views
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect(); // ✅ correct function

  const { id } = params; // ✅ no need to await

  try {
    const movie = await Movie.findById(id); // ✅ use _id instead of { id }
    if (!movie) {
      return NextResponse.json(
        { success: false, message: "Movie not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      views: movie.views ?? 0,
    });
  } catch (err) {
    console.error("Error fetching views:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// POST → increment movie views
export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect(); // ✅ correct function

  const { id } = params; // ✅ no need to await

  try {
    const movie = await Movie.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!movie) {
      return NextResponse.json(
        { success: false, message: "Movie not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      views: movie.views,
    });
  } catch (err) {
    console.error("Error incrementing views:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
