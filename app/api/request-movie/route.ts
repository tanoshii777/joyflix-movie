import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "requests.json");

// helper: load requests
async function loadRequests() {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// helper: save requests
async function saveRequests(requests: any[]) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(requests, null, 2));
}

// POST: create a new request
export async function POST(req: Request) {
  const body = await req.json();
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

  return NextResponse.json({ success: true, request: newReq });
}

// GET: list all requests
export async function GET() {
  const requests = await loadRequests();
  return NextResponse.json(requests);
}

// PATCH: update a request (approve, mark downloaded, etc.)
export async function PATCH(req: Request) {
  const body = await req.json();
  const requests = await loadRequests();

  const idx = requests.findIndex((r: any) => r.id === body.id);
  if (idx === -1)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  requests[idx] = { ...requests[idx], ...body };
  await saveRequests(requests);

  return NextResponse.json({ success: true, request: requests[idx] });
}

// DELETE: remove a request
export async function DELETE(req: Request) {
  const body = await req.json();
  let requests = await loadRequests();

  requests = requests.filter((r: any) => r.id !== body.id);
  await saveRequests(requests);

  return NextResponse.json({ success: true });
}
