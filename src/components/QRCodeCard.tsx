"use client"

import { useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { QRCodeWrapper } from "@/components/QRCodeWrapper"
import { toast } from "sonner"
import { Edit, Link as LinkIcon, Image as ImageIcon, ExternalLink, Copy, Download } from "lucide-react"

interface DynamicCode {
  id: string
  short_code: string
  type: 'LINK' | 'IMAGE'
  target_content: string
  visits: number
  created_at: string
  active: boolean
}

interface QRCodeCardProps {
  code: DynamicCode
  origin: string
}

export function QRCodeCard({ code, origin }: QRCodeCardProps) {
  const downloadRef = useRef<((ext: string) => void) | null>(null)
  const qrUrl = origin ? `${origin}/q/${code.short_code}` : ""

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success("链接已复制")
  }

  const handleDownloadQR = () => {
    if (downloadRef.current) {
      downloadRef.current('png')
    } else {
      toast.error("下载失败")
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-100 p-4 flex flex-row justify-between items-center space-y-0">
        <span className="font-mono text-sm font-bold bg-white px-2 py-1 rounded border">
          {code.short_code}
        </span>
        {code.type === 'LINK' ? <LinkIcon size={16} /> : <ImageIcon size={16} />}
      </CardHeader>
      <CardContent className="p-6 flex flex-col items-center gap-4">
        <div className="border p-2 bg-white rounded flex justify-center">
          {qrUrl && (
            <QRCodeWrapper 
              url={qrUrl} 
              width={200} 
              height={200}
              downloadRef={downloadRef}
            />
          )}
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
        <Button variant="ghost" size="icon" className="w-full" onClick={handleDownloadQR} title="下载二维码">
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
}
