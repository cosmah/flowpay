import type { Metadata } from "next"
import { Figtree, Syne } from "next/font/google"
import { AppProviders } from "@/components/providers/app-providers"
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
    default: "FlowPay",
    template: "%s · FlowPay",
  },
  description:
    "FlowPay — marketing content and workflow management from brief to approved library assets.",
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
      <body className="flex min-h-full flex-col font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
