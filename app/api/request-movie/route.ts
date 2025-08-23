import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "requests.json");

// helper: load requests
async function loadRequests() {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("[v0] Error loading requests:", error);
    return [];
  }
}

// helper: save requests
async function saveRequests(requests: any[]) {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(requests, null, 2));
  } catch (error) {
    console.error("[v0] Error saving requests:", error);
    throw new Error("Failed to save request to database");
  }
}

// POST: create a new request
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.movieId || !body.title) {
      return NextResponse.json(
        { error: "Missing required fields: movieId and title are required" },
        { status: 400 }
      );
    }

    const requests = await loadRequests();

    // check if already requested
    const existing = requests.find(
      (r: any) => r.movieId === body.movieId && r.status !== "downloaded"
    );

    if (existing) {
      return NextResponse.json(
        { error: "Already requested", request: existing },
        { status: 400 }
      );
    }

    const newReq = {
      id: Date.now(),
      movieId: body.movieId,
      title: body.title,
      year: body.year,
      user: body.user || "guest",
      status: "pending", // pending | approved | downloaded
      createdAt: new Date().toISOString(),
    };

    requests.push(newReq);
    await saveRequests(requests);

    console.log("[v0] Movie request created successfully:", newReq.title);
    return NextResponse.json({ success: true, request: newReq });
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
  try {
    const requests = await loadRequests();
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
  try {
    const body = await req.json();
    const requests = await loadRequests();

    const idx = requests.findIndex((r: any) => r.id === body.id);
    if (idx === -1) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    requests[idx] = { ...requests[idx], ...body };
    await saveRequests(requests);

    console.log("[v0] Request updated successfully:", requests[idx].title);
    return NextResponse.json({ success: true, request: requests[idx] });
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
  try {
    const body = await req.json();
    let requests = await loadRequests();

    const originalLength = requests.length;
    requests = requests.filter((r: any) => r.id !== body.id);

    if (requests.length === originalLength) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    await saveRequests(requests);

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
