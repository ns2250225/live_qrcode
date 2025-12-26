"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

export default function EditQRPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [type, setType] = useState<'LINK' | 'IMAGE'>('LINK')
  const [linkUrl, setLinkUrl] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchCode()
  }, [])

  const fetchCode = async () => {
    try {
      const res = await fetch(`/api/qrcode/${id}`)
      if (res.ok) {
        const data = await res.json()
        const code = data.code
        setType(code.type)
        if (code.type === 'LINK') {
          setLinkUrl(code.target_content)
        }
      } else {
        toast.error("获取活码失败")
        router.push("/dashboard")
      }
    } catch (error) {
      toast.error("获取活码出错")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const formData = new FormData()
    formData.append('type', type)
    if (type === 'LINK') {
      formData.append('linkUrl', linkUrl)
    } else {
      if (imageFile) formData.append('imageFile', imageFile)
    }

    try {
      const res = await fetch(`/api/qrcode/${id}`, {
        method: "PUT",
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("活码更新成功！")
        router.push("/dashboard")
        router.refresh()
      } else {
        toast.error(data.error || "更新失败")
      }
    } catch (error) {
      toast.error("发生错误")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div>加载中...</div>

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>编辑活码</CardTitle>
          <CardDescription>
            更新活码的目标内容。二维码图案本身保持不变。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={type} onValueChange={(v) => setType(v as 'LINK' | 'IMAGE')}>
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
                </div>
              </TabsContent>

              <TabsContent value="IMAGE" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image">上传新图片</Label>
                  <Input 
                    id="image" 
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-sm text-gray-500">留空以保留现有图片（如果适用）。</p>
                </div>
              </TabsContent>

              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "更新中..." : "更新活码"}
                </Button>
              </div>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
