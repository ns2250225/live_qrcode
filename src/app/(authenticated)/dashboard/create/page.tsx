"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

export default function CreateQRPage() {
  const [type, setType] = useState<'LINK' | 'IMAGE'>('LINK')
  const [linkUrl, setLinkUrl] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append('type', type)
    if (type === 'LINK') {
      formData.append('linkUrl', linkUrl)
    } else {
      if (imageFile) formData.append('imageFile', imageFile)
    }

    try {
      const res = await fetch("/api/qrcode/create", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("活码创建成功！已扣除 10 积分。")
        router.push("/dashboard")
        router.refresh()
      } else {
        toast.error(data.error || "创建失败")
      }
    } catch (error) {
      toast.error("发生错误")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>新建活码</CardTitle>
          <CardDescription>
            选择动态活码的内容类型。
            创建活码将消耗 <strong>10 积分</strong>。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="LINK" onValueChange={(v) => setType(v as 'LINK' | 'IMAGE')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="LINK">链接 / URL</TabsTrigger>
              <TabsTrigger value="IMAGE">图片</TabsTrigger>
            </TabsList>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              
              <TabsContent value="LINK" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">目标 URL</Label>
                  <Input 
                    id="url" 
                    placeholder="https://example.com" 
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    required={type === 'LINK'}
                  />
                  <p className="text-sm text-gray-500">输入用户将被重定向到的网站 URL。</p>
                </div>
              </TabsContent>

              <TabsContent value="IMAGE" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image">上传图片</Label>
                  <Input 
                    id="image" 
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    required={type === 'IMAGE'}
                  />
                  <p className="text-sm text-gray-500">上传二维码图片（如微信个人名片）或其他图片。</p>
                </div>
              </TabsContent>

              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "创建中..." : "创建并扣除 10 积分"}
                </Button>
              </div>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
