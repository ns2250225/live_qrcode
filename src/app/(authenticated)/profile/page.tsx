"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Copy } from "lucide-react"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [origin, setOrigin] = useState("")

  useEffect(() => {
    setOrigin(window.location.origin)
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch (error) {
      toast.error("加载个人资料失败")
    } finally {
      setLoading(false)
    }
  }

  const copyReferral = () => {
    if (!user) return
    const link = `${origin}/register?ref=${user.referral_code}`
    navigator.clipboard.writeText(link)
    toast.success("推荐链接已复制！")
  }

  if (loading) return <div>加载中...</div>
  if (!user) return <div>加载用户出错</div>

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>个人资料</CardTitle>
          <CardDescription>管理您的账户设置。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>邮箱</Label>
            <Input value={user.email} disabled />
          </div>
          <div className="space-y-2">
            <Label>积分</Label>
            <div className="text-2xl font-bold">{user.points}</div>
            <p className="text-sm text-gray-500">
                每邀请一个用户您将获得 10 积分。创建一个活码消耗 10 积分。
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>推荐计划</CardTitle>
          <CardDescription>邀请好友并赚取积分。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>您的推荐链接</Label>
            <div className="flex gap-2">
                <Input value={`${origin}/register?ref=${user.referral_code}`} readOnly />
                <Button variant="outline" size="icon" onClick={copyReferral}>
                    <Copy size={16} />
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
