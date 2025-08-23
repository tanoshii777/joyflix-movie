"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

export default function Breadcrumb() {
  const pathname = usePathname()

  // Don't show breadcrumbs on auth pages or home page
  if (pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return null
  }

  const pathSegments = pathname.split("/").filter(Boolean)

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    ...pathSegments.map((segment, index) => {
      const href = "/" + pathSegments.slice(0, index + 1).join("/")
      const label = segment.charAt(0).toUpperCase() + segment.slice(1)
      return { label, href }
    }),
  ]

  return (
    <nav className="bg-gray-900 px-6 py-3 border-b border-gray-800">
      <div className="flex items-center space-x-2 text-sm">
        {breadcrumbItems.map((item, index) => (
          <div key={item.href} className="flex items-center">
            {index === 0 && <Home className="w-4 h-4 mr-1" />}

            {index === breadcrumbItems.length - 1 ? (
              <span className="text-gray-400">{item.label}</span>
            ) : (
              <Link href={item.href} className="text-gray-300 hover:text-white transition-colors">
                {item.label}
              </Link>
            )}

            {index < breadcrumbItems.length - 1 && <ChevronRight className="w-4 h-4 mx-2 text-gray-500" />}
          </div>
        ))}
      </div>
    </nav>
  )
}
