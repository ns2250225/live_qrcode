import { Navbar } from "@/components/Navbar"

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="p-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  )
}
