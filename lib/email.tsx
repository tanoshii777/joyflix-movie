import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface MovieRequest {
  id: string
  movieId: string
  title: string
  year: string | number
  user: string
  status: string
  createdAt: string
  userEmail: string
}

// Helper: choose recipient based on environment
function getRecipient(userEmail: string): string {
  if (process.env.NODE_ENV !== "production") {
    // ✅ In dev/test → force all emails to your Gmail
    return "aljoybascon.programmer@gmail.com"
  }
  // ✅ In production → send to actual user
  return userEmail
}

export const emailService = {
  async sendMovieApprovedNotification(request: MovieRequest, userEmail: string): Promise<boolean> {
    try {
      const { data, error } = await resend.emails.send({
        from: "JoyFlix <onboarding@resend.dev>", // works immediately
        to: [getRecipient(userEmail)], // ✅ env-aware recipient
        subject: `Movie Request Approved: ${request.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">Movie Request Approved! 🎬</h2>
            <p>Great news! Your movie request has been approved.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #374151;">Movie Details:</h3>
              <p><strong>Title:</strong> ${request.title}</p>
              <p><strong>Year:</strong> ${request.year}</p>
              <p><strong>Request ID:</strong> #${request.id.toString().slice(-6)}</p>
              <p><strong>Status:</strong> <span style="color: #16a34a; font-weight: bold;">Approved</span></p>
            </div>
            
            <p>We'll notify you once the movie is available for download.</p>
            
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              Thank you for using JoyFlix!<br>
              - 🔥 TEAM ALJOY 🔥
            </p>
          </div>
        `,
      })

      if (error) {
        console.error("[Email] Error sending approved notification:", error)
        return false
      }

      console.log("[Email] Approved notification sent successfully:", data)
      return true
    } catch (error) {
      console.error("[Email] Failed to send approved notification:", error)
      return false
    }
  },

  async sendMovieAvailableNotification(request: MovieRequest, userEmail: string): Promise<boolean> {
    try {
      const { data, error } = await resend.emails.send({
        from: "JoyFlix <onboarding@resend.dev>", // works immediately
        to: [getRecipient(userEmail)], // ✅ env-aware recipient
        subject: `Movie Available: ${request.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;"> ${request.title} is Now Available to Watch! 🎉</h2>
            <p>Your requested movie is now available!</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #374151;">Movie Details:</h3>
              <p><strong>Title:</strong> ${request.title}</p>
              <p><strong>Year:</strong> ${request.year}</p>
              <p><strong>Request ID:</strong> #${request.id.toString().slice(-6)}</p>
              <p><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">Available</span></p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://192.168.68.103:3000"}" 
                 style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Visit JoyFlix
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              Thank you for using JoyFlix!<br>
              - 🔥 TEAM ALJOY 🔥
            </p>
          </div>
        `,
      })

      if (error) {
        console.error("[Email] Error sending available notification:", error)
        return false
      }

      console.log("[Email] Available notification sent successfully:", data)
      return true
    } catch (error) {
      console.error("[Email] Failed to send available notification:", error)
      return false
    }
  },
}
