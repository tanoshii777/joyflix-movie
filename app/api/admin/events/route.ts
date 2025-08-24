import type { NextRequest } from "next/server"
import RealTimeManager from "@/lib/realtime-manager"
import { randomUUID } from "crypto"

export async function GET(request: NextRequest) {
  console.log("[v0] New SSE connection established for admin dashboard")

  const encoder = new TextEncoder()
  const clientId = randomUUID()
  const realTimeManager = RealTimeManager.getInstance()

  const stream = new ReadableStream({
    start(controller) {
      // Add this client to the real-time manager
      realTimeManager.addClient(clientId, controller, encoder)

      // Send initial connection confirmation
      const data = `data: ${JSON.stringify({
        type: "connected",
        clientId,
        timestamp: new Date().toISOString(),
      })}\n\n`
      controller.enqueue(encoder.encode(data))

      // Send initial data immediately
      realTimeManager.broadcastUpdate()

      // Cleanup on connection close
      request.signal.addEventListener("abort", () => {
        console.log(`[v0] SSE connection closed for client: ${clientId}`)
        realTimeManager.removeClient(clientId)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  })
}
