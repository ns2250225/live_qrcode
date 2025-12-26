"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit, Link as LinkIcon, Image as ImageIcon, ExternalLink, Settings, Copy, Download } from "lucide-react"

interface DynamicCode {
  id: string
  short_code: string
  type: 'LINK' | 'IMAGE'
  target_content: string
  visits: number
  created_at: string
  active: boolean
}

export default function DashboardPage() {
  const [codes, setCodes] = useState<DynamicCode[]>([])
  const [loading, setLoading] = useState(true)
  const [origin, setOrigin] = useState("")
  const [customDomain, setCustomDomain] = useState("")
  const [showDomainSettings, setShowDomainSettings] = useState(false)
  const [isLocalhost, setIsLocalhost] = useState(false)

  useEffect(() => {
    // Check for env var or use window.location.origin
    const envUrl = process.env.NEXT_PUBLIC_APP_URL
    const initialOrigin = envUrl || window.location.origin
    setOrigin(initialOrigin)
    setCustomDomain(initialOrigin)
    
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        setIsLocalhost(true)
    }

    fetchCodes()
  }, [])

  const fetchCodes = async () => {
    try {
      const res = await fetch("/api/qrcode/list")
      if (res.ok) {
        const data = await res.json()
        setCodes(data.codes)
      }
    } catch (error) {
      toast.error("加载活码失败")
    } finally {
      setLoading(false)
    }
  }

  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomDomain(e.target.value)
  }

  const applyDomain = () => {
    let domain = customDomain.trim()
    // Remove trailing slash
    if (domain.endsWith('/')) {
        domain = domain.slice(0, -1)
    }
    // Add protocol if missing
    if (!domain.startsWith('http')) {
        domain = `http://${domain}`
    }
    setOrigin(domain)
    setCustomDomain(domain)
    toast.success("二维码域名已更新")
    setShowDomainSettings(false)
  }

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success("链接已复制")
  }

  const handleDownloadQR = (id: string, shortCode: string) => {
    const svg = document.getElementById(`qr-${id}`)
    if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg)
        const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `qrcode-${shortCode}.svg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    } else {
        toast.error("下载失败")
    }
  }

  if (loading) return <div>加载中...</div>

  return (
    <div className="space-y-6">
      {isLocalhost && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Settings className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                检测到您正在使用 localhost 访问。手机无法直接扫描 localhost 的二维码。
                <br />
                请点击右侧 <strong>"设置二维码域名"</strong>，将其修改为您电脑的局域网 IP (例如 http://192.168.x.x:3000)，并确保手机连接同一 WiFi。
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">我的活码</h1>
        <Button variant="outline" size="sm" onClick={() => setShowDomainSettings(!showDomainSettings)}>
            <Settings size={16} className="mr-2" /> 设置二维码域名
        </Button>
      </div>

      {showDomainSettings && (
        <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
                <div className="flex flex-col gap-2">
                    <Label>自定义域名 / IP (用于生成二维码)</Label>
                    <div className="flex gap-2">
                        <Input 
                            value={customDomain} 
                            onChange={handleDomainChange} 
                            placeholder="例如: http://192.168.1.5:3000 或 https://mydomain.com"
                        />
                        <Button onClick={applyDomain}>应用</Button>
                    </div>
                    <p className="text-sm text-blue-600">
                        提示: 如果手机扫描无法跳转，请将此处改为电脑的局域网 IP (如 http://192.168.x.x:3000)，并确保手机和电脑在同一 WiFi 下。
                    </p>
                </div>
            </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {codes.length === 0 && (
            <p className="text-gray-500 col-span-full text-center py-10">您还没有创建任何活码。</p>
        )}
        {codes.map((code) => {
           const qrUrl = origin ? `${origin}/q/${code.short_code}` : ""
           return (
            <Card key={code.id} className="overflow-hidden">
                <CardHeader className="bg-gray-100 p-4 flex flex-row justify-between items-center space-y-0">
                    <span className="font-mono text-sm font-bold bg-white px-2 py-1 rounded border">
                        {code.short_code}
                    </span>
                    {code.type === 'LINK' ? <LinkIcon size={16} /> : <ImageIcon size={16} />}
                </CardHeader>
                <CardContent className="p-6 flex flex-col items-center gap-4">
                    <div className="border p-2 bg-white rounded">
                        {qrUrl && <QRCodeSVG id={`qr-${code.id}`} value={qrUrl} size={150} level="H" includeMargin={true} />}
                    </div>
                    <div className="text-center w-full">
                        <p className="text-sm text-gray-500 truncate w-full" title={code.target_content}>
                            目标: {code.target_content}
                        </p>
                        <p className="text-sm font-semibold mt-1">访问量: {code.visits}</p>
                    </div>
                </CardContent>
                <CardFooter className="bg-gray-50 p-3 grid grid-cols-4 gap-2">
                    <Button variant="ghost" size="icon" className="w-full" asChild title="测试跳转">
                        <a href={qrUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={16} />
                        </a>
                    </Button>
                    <Button variant="ghost" size="icon" className="w-full" onClick={() => handleCopyLink(qrUrl)} title="复制链接">
                        <Copy size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-full" onClick={() => handleDownloadQR(code.id, code.short_code)} title="下载二维码">
                        <Download size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-full" asChild title="编辑">
                        <Link href={`/dashboard/edit/${code.id}`}>
                            <Edit size={16} />
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
           )
        })}
      </div>
    </div>
  )
}
