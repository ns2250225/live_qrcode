"use client"

import React, { useEffect, useRef, useState } from "react"
import QRCodeStyling from "qr-code-styling"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "sonner"

interface QRCodeWrapperProps {
  url: string
  width?: number
  height?: number
  logo?: string
  downloadRef?: React.MutableRefObject<((extension: string) => void) | null>
}

export function QRCodeWrapper({ url, width = 300, height = 300, logo, downloadRef }: QRCodeWrapperProps) {
  const ref = useRef<HTMLDivElement>(null)
  const qrCode = useRef<QRCodeStyling | null>(null)

  useEffect(() => {
    qrCode.current = new QRCodeStyling({
      width: width,
      height: height,
      type: "svg",
      data: url,
      image: logo,
      dotsOptions: {
        color: "#4267b2",
        type: "rounded"
      },
      cornersSquareOptions: {
        type: "extra-rounded",
        color: "#4267b2"
      },
      cornersDotOptions: {
        type: "dot",
        color: "#4267b2"
      },
      backgroundOptions: {
        color: "#ffffff",
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 10
      }
    })

    if (ref.current) {
      ref.current.innerHTML = ''
      qrCode.current.append(ref.current)
    }
  }, [])

  useEffect(() => {
    if (qrCode.current) {
      qrCode.current.update({
        data: url,
        image: logo
      })
    }
  }, [url, logo])

  useEffect(() => {
    if (downloadRef) {
      downloadRef.current = (extension: string) => {
        if (qrCode.current) {
            qrCode.current.download({
                extension: extension as 'png' | 'jpeg' | 'webp' | 'svg'
            })
        }
      }
    }
  }, [downloadRef])

  return <div ref={ref} />
}
