import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MovieRequest from "@/models/MovieRequest";

console.log(
  "[v0] API Route loaded - request-movie endpoint using MongoDB at",
  new Date().toISOString()
);

// POST: create a new request
export async function POST(req: Request) {
  console.log("[v0] POST request received at /api/request-movie");
  try {
    console.log("[v0] Connecting to database..."); // Added database connection logging
    await dbConnect();
    console.log("[v0] Database connected, processing request...");

    const body = await req.json();
    console.log("[v0] Request body:", body); // Added request body logging

    if (!body.movieId || !body.title) {
      return NextResponse.json(
        { error: "Missing required fields: movieId and title are required" },
        { status: 400 }
      );
    }

    // Check if already requested
    const existing = await MovieRequest.findOne({
      movieId: body.movieId,
      status: { $ne: "downloaded" },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already requested", request: existing },
        { status: 400 }
      );
    }

    const newRequest = new MovieRequest({
      movieId: body.movieId,
      title: body.title,
      year: body.year,
      user: body.user || "guest",
      status: "pending",
    });

    await newRequest.save();

    console.log(
      "[v0] Movie request created successfully:",
      newRequest.title,
      "ID:",
      newRequest._id
    );
    return NextResponse.json({ success: true, request: newRequest });
  } catch (error) {
    console.error("[v0] Error creating movie request:", error);
    return NextResponse.json(
      { error: "Failed to process movie request. Please try again." },
      { status: 500 }
    );
  }
}

// GET: list all requests
export async function GET() {
  console.log("[v0] GET request received at /api/request-movie");
  try {
    console.log("[v0] Connecting to database..."); // Added database connection logging
    await dbConnect();
    const requests = await MovieRequest.find({}).sort({ createdAt: -1 });
    console.log("[v0] Found", requests.length, "requests"); // Added request count logging
    return NextResponse.json(requests);
  } catch (error) {
    console.error("[v0] Error fetching requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

// PATCH: update a request (approve, mark downloaded, etc.)
export async function PATCH(req: Request) {
  console.log("[v0] PATCH request received at /api/request-movie");
  try {
    await dbConnect();
    const body = await req.json();

    const request = await MovieRequest.findByIdAndUpdate(
      body._id || body.id,
      { ...body },
      { new: true }
    );

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    console.log("[v0] Request updated successfully:", request.title);
    return NextResponse.json({ success: true, request });
  } catch (error) {
    console.error("[v0] Error updating request:", error);
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}

// DELETE: remove a request
export async function DELETE(req: Request) {
  console.log("[v0] DELETE request received at /api/request-movie");
  try {
    await dbConnect();
    const body = await req.json();

    const request = await MovieRequest.findByIdAndDelete(body._id || body.id);

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    console.log("[v0] Request deleted successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] Error deleting request:", error);
    return NextResponse.json(
      { error: "Failed to delete request" },
      { status: 500 }
    );
  }
}
