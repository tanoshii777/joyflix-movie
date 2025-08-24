import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import { PasswordUtils } from "@/lib/auth"

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateUsername = (username: string) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

export async function POST(req: Request) {
  try {
    await dbConnect()
    const { fullName, username, email, password } = await req.json()

    // Validation
    if (!fullName?.trim()) {
      return NextResponse.json({ error: "Full name is required and cannot be empty" }, { status: 400 })
    }

    if (!username?.trim()) {
      return NextResponse.json({ error: "Username is required and cannot be empty" }, { status: 400 })
    }

    if (!validateUsername(username)) {
      return NextResponse.json(
        { error: "Username must be 3-20 characters long and contain only letters, numbers, and underscores" },
        { status: 400 },
      )
    }

    if (!email?.trim()) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 })
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    // Enhanced password validation
    const passwordValidation = PasswordUtils.validateStrength(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json({ error: passwordValidation.errors[0] }, { status: 400 })
    }

    // Check for existing users
    const existingEmail = await User.findOne({ email: email.toLowerCase() })
    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please use a different email or try logging in." },
        { status: 400 },
      )
    }

    const existingUsername = await User.findOne({ username: username.toLowerCase() })
    if (existingUsername) {
      return NextResponse.json(
        { error: "This username is already taken. Please choose a different username." },
        { status: 400 },
      )
    }

    // Hash password using enhanced utility
    const hashedPassword = await PasswordUtils.hash(password)

    // Create user
    const newUser = await User.create({
      fullName: fullName.trim(),
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      loginCount: 0,
      createdAt: new Date(),
    })

    return NextResponse.json(
      {
        success: true,
        message: `Welcome to JoyFlix, ${fullName}! Your account has been created successfully. You can now log in and start exploring our movie collection.`,
        user: {
          id: newUser._id,
          fullName: newUser.fullName,
          username: newUser.username,
          email: newUser.email,
        },
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Registration error:", error)

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      return NextResponse.json(
        { error: `This ${field} is already registered. Please use a different ${field}.` },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: "An unexpected error occurred during registration. Please try again later." },
      { status: 500 },
    )
  }
}
