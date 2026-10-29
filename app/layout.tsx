import type { Metadata } from "next"
import { Figtree, Syne } from "next/font/google"
import "./globals.css"

const figtree = Figtree({
  variable: "--font-sans",
  subsets: ["latin"],
})

const syne = Syne({
  variable: "--font-heading",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Relworx",
    template: "%s · Relworx",
  },
  description:
    "Marketing content and workflow management — from brief to approved library assets.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${syne.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  )
}
