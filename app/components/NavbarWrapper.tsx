"use client"

import { usePathname } from "next/navigation"
import Navbar from "./Navbar"
import Breadcrumb from "./Breadcrumb"

export default function NavbarWrapper() {
  const pathname = usePathname()

  if (pathname === "/login" || pathname === "/register") {
    return null
  }

  return (
    <>
      <Navbar />
      <Breadcrumb />
    </>
  )
}
