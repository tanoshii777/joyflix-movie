import type { ChangeStream } from "mongodb"
import clientPromise from "./mongodb"

interface SSEClient {
  id: string
  controller: ReadableStreamDefaultController
  encoder: TextEncoder
}

class RealTimeManager {
  private static instance: RealTimeManager
  private clients: Map<string, SSEClient> = new Map()
  private changeStream: ChangeStream | null = null
  private isWatching = false

  static getInstance(): RealTimeManager {
    if (!RealTimeManager.instance) {
      RealTimeManager.instance = new RealTimeManager()
    }
    return RealTimeManager.instance
  }

  async startWatching() {
    if (this.isWatching) return

    try {
      console.log("[v0] Starting MongoDB change stream for real-time updates...")
      const client = await clientPromise
      const db = client.db("tanoshi")

      // Watch the movierequests collection for changes
      this.changeStream = db.collection("movierequests").watch(
        [
          {
            $match: {
              operationType: { $in: ["insert", "update", "delete", "replace"] },
            },
          },
        ],
        { fullDocument: "updateLookup" },
      )

      this.changeStream.on("change", async (change) => {
        console.log("[v0] Database change detected:", change.operationType)
        await this.broadcastUpdate()
      })

      this.changeStream.on("error", (error) => {
        console.error("[v0] Change stream error:", error)
        this.isWatching = false
        // Retry after 5 seconds
        setTimeout(() => this.startWatching(), 5000)
      })

      this.isWatching = true
      console.log("[v0] MongoDB change stream started successfully")
    } catch (error) {
      console.error("[v0] Failed to start change stream:", error)
      console.log("[v0] Falling back to polling mode...")
      this.isWatching = false
    }
  }

  async stopWatching() {
    if (this.changeStream) {
      await this.changeStream.close()
      this.changeStream = null
    }
    this.isWatching = false
    console.log("[v0] MongoDB change stream stopped")
  }

  addClient(clientId: string, controller: ReadableStreamDefaultController, encoder: TextEncoder) {
    this.clients.set(clientId, { id: clientId, controller, encoder })
    console.log(`[v0] SSE client connected: ${clientId} (${this.clients.size} total)`)

    // Start watching if this is the first client
    if (this.clients.size === 1) {
      this.startWatching()
    }
  }

  removeClient(clientId: string) {
    this.clients.delete(clientId)
    console.log(`[v0] SSE client disconnected: ${clientId} (${this.clients.size} remaining)`)

    // Stop watching if no clients remain
    if (this.clients.size === 0) {
      this.stopWatching()
    }
  }

  async broadcastUpdate() {
    if (this.clients.size === 0) return

    try {
      // Fetch latest requests from database
      const client = await clientPromise
      const db = client.db("tanoshi")
      const requests = await db.collection("movierequests").find({}).sort({ createdAt: -1 }).toArray()

      const updateData = JSON.stringify({
        type: "requests_update",
        requests,
        timestamp: new Date().toISOString(),
      })

      // Broadcast to all connected clients
      const message = `data: ${updateData}\n\n`

      for (const [clientId, client] of this.clients) {
        try {
          client.controller.enqueue(client.encoder.encode(message))
        } catch (error) {
          console.error(`[v0] Failed to send to client ${clientId}:`, error)
          this.removeClient(clientId)
        }
      }

      console.log(`[v0] Broadcasted update to ${this.clients.size} clients`)
    } catch (error) {
      console.error("[v0] Failed to broadcast update:", error)
    }
  }

  // Method to trigger immediate updates from API endpoints
  async triggerUpdate() {
    console.log("[v0] Manual update trigger received")
    await this.broadcastUpdate()
  }
}

export const realTimeManager = RealTimeManager.getInstance()

export default RealTimeManager
