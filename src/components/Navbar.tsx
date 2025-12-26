"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useEffect, useState } from "react"

export function Navbar() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.user?.role === 'ADMIN') setIsAdmin(true)
      })
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
      router.refresh()
    } catch (error) {
      toast.error("退出失败")
    }
  }

  return (
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="font-bold text-xl text-gray-800">
          <Link href="/dashboard">LiveQR</Link>
        </div>
        <div className="flex gap-4">
          {isAdmin && (
            <Link href="/admin/users">
              <Button variant="destructive">管理后台</Button>
            </Link>
          )}
          <Link href="/dashboard/create">
            <Button variant="default">新建活码</Button>
          </Link>
          <Link href="/profile">
            <Button variant="outline">个人中心</Button>
          </Link>
          <Button variant="ghost" onClick={handleLogout}>退出登录</Button>
        </div>
      </nav>
  )
}
