interface EmailTemplate {
  subject: string
  html: string
  text: string
}

interface MovieRequest {
  id: number
  movieId: string
  title: string
  year: string
  user: string
  status: string
  createdAt: string
  userEmail?: string
}

export class EmailService {
  private apiKey: string
  private fromEmail: string

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || ""
    this.fromEmail = process.env.FROM_EMAIL || "noreply@joyflix.com"
  }

  private createMovieApprovedTemplate(request: MovieRequest): EmailTemplate {
    const subject = `🎬 Your movie request "${request.title}" has been approved!`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Movie Request Approved</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #be123c 0%, #9f1239 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 2px;">JOYFLIX</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your Movie Request Has Been Approved!</p>
          </div>
          
          <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 80px; height: 80px; background: #f1f5f9; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; margin-bottom: 20px;">🎬</div>
              <h2 style="color: #1e293b; margin: 0 0 10px 0; font-size: 24px;">Great News!</h2>
              <p style="color: #64748b; margin: 0; font-size: 16px;">Your requested movie is now being processed</p>
            </div>
            
            <div style="background: #f8fafc; padding: 25px; border-radius: 8px; border-left: 4px solid #be123c; margin: 30px 0;">
              <h3 style="color: #be123c; margin: 0 0 15px 0; font-size: 18px;">Movie Details</h3>
              <p style="margin: 8px 0; color: #374151;"><strong>Title:</strong> ${request.title}</p>
              <p style="margin: 8px 0; color: #374151;"><strong>Year:</strong> ${request.year}</p>
              <p style="margin: 8px 0; color: #374151;"><strong>Request ID:</strong> #${request.id}</p>
              <p style="margin: 8px 0; color: #374151;"><strong>Status:</strong> <span style="color: #059669; font-weight: 600;">Approved</span></p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}" 
                 style="display: inline-block; background: #be123c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Visit JOYFLIX
              </a>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
              <p style="color: #64748b; font-size: 14px; margin: 0;">
                We'll notify you again once the movie is available for streaming. Thank you for using JOYFLIX!
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
            <p>© 2024 JOYFLIX. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </body>
      </html>
    `

    const text = `
JOYFLIX - Movie Request Approved

Great news! Your movie request has been approved.

Movie Details:
- Title: ${request.title}
- Year: ${request.year}
- Request ID: #${request.id}
- Status: Approved

We'll notify you again once the movie is available for streaming.

Visit JOYFLIX: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}

Thank you for using JOYFLIX!
    `

    return { subject, html, text }
  }

  private createMovieAvailableTemplate(request: MovieRequest): EmailTemplate {
    const subject = `🍿 "${request.title}" is now available on JOYFLIX!`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Movie Now Available</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 2px;">JOYFLIX</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your Movie is Ready to Watch!</p>
          </div>
          
          <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 80px; height: 80px; background: #f1f5f9; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; margin-bottom: 20px;">🍿</div>
              <h2 style="color: #1e293b; margin: 0 0 10px 0; font-size: 24px;">Ready to Stream!</h2>
              <p style="color: #64748b; margin: 0; font-size: 16px;">Your requested movie is now available</p>
            </div>
            
            <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; border-left: 4px solid #059669; margin: 30px 0;">
              <h3 style="color: #059669; margin: 0 0 15px 0; font-size: 18px;">Now Streaming</h3>
              <p style="margin: 8px 0; color: #374151;"><strong>Title:</strong> ${request.title}</p>
              <p style="margin: 8px 0; color: #374151;"><strong>Year:</strong> ${request.year}</p>
              <p style="margin: 8px 0; color: #374151;"><strong>Status:</strong> <span style="color: #059669; font-weight: 600;">Available Now</span></p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}" 
                 style="display: inline-block; background: #059669; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 18px; margin-bottom: 15px;">
                🎬 Watch Now
              </a>
              <p style="color: #64748b; font-size: 14px; margin: 0;">Click above to start streaming immediately</p>
            </div>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
              <p style="color: #64748b; font-size: 14px; margin: 0;">
                Enjoy your movie! Don't forget to rate it and add it to your watchlist for easy access.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
            <p>© 2024 JOYFLIX. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </body>
      </html>
    `

    const text = `
JOYFLIX - Movie Now Available

Great news! Your requested movie is now available for streaming.

Movie Details:
- Title: ${request.title}
- Year: ${request.year}
- Status: Available Now

Watch now: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}

Enjoy your movie!
    `

    return { subject, html, text }
  }

  async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      // Using Resend API (you can replace with any email service)
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [to],
          subject: template.subject,
          html: template.html,
          text: template.text,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error("[Email] Failed to send email:", error)
        return false
      }

      console.log("[Email] Email sent successfully to:", to)
      return true
    } catch (error) {
      console.error("[Email] Error sending email:", error)
      return false
    }
  }

  async sendMovieApprovedNotification(request: MovieRequest, userEmail: string): Promise<boolean> {
    const template = this.createMovieApprovedTemplate(request)
    return this.sendEmail(userEmail, template)
  }

  async sendMovieAvailableNotification(request: MovieRequest, userEmail: string): Promise<boolean> {
    const template = this.createMovieAvailableTemplate(request)
    return this.sendEmail(userEmail, template)
  }

  // Fallback method for when email service is not configured
  async logEmailNotification(type: string, request: MovieRequest, userEmail: string): Promise<void> {
    console.log(`[Email] Would send ${type} notification:`)
    console.log(`  To: ${userEmail}`)
    console.log(`  Movie: ${request.title} (${request.year})`)
    console.log(`  Status: ${request.status}`)
    console.log(`  Request ID: ${request.id}`)
  }
}

export const emailService = new EmailService()
