"use client"

import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Loader2, RotateCw, Upload } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { buildApiUrl } from "@/lib/api"

interface AvatarEditorUploadProps {
  initialUrl?: string | null
  onUploaded?: (url: string) => void
}

const PREVIEW_SIZE = 256
const OUTPUT_SIZE = 512

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Falha ao carregar imagem"))
    img.src = src
  })
}

export function AvatarEditorUpload({ initialUrl, onUploaded }: AvatarEditorUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [sourceDataUrl, setSourceDataUrl] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialUrl || null)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)

  const hasSource = Boolean(sourceDataUrl)

  const previewStyle = useMemo(
    () => ({
      transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom}) rotate(${rotation}deg)`,
      transformOrigin: "center center",
    }),
    [offsetX, offsetY, rotation, zoom],
  )

  useEffect(() => {
    setAvatarUrl(initialUrl || null)
  }, [initialUrl])

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Formato inválido", {
        description: "Use arquivos JPG, PNG ou WebP.",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande", {
        description: "O tamanho máximo permitido é 5MB.",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setSourceDataUrl(String(reader.result))
      setZoom(1)
      setRotation(0)
      setOffsetX(0)
      setOffsetY(0)
    }
    reader.readAsDataURL(file)
  }

  async function handleUploadEdited() {
    if (!sourceDataUrl) return

    setLoading(true)
    try {
      const image = await loadImage(sourceDataUrl)
      const canvas = document.createElement("canvas")
      canvas.width = OUTPUT_SIZE
      canvas.height = OUTPUT_SIZE
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        throw new Error("Não foi possível iniciar o editor de imagem.")
      }

      ctx.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE)

      const baseScale = Math.max(PREVIEW_SIZE / image.width, PREVIEW_SIZE / image.height)
      const scale = baseScale * zoom * (OUTPUT_SIZE / PREVIEW_SIZE)
      const rad = (rotation * Math.PI) / 180
      const moveX = offsetX * (OUTPUT_SIZE / PREVIEW_SIZE)
      const moveY = offsetY * (OUTPUT_SIZE / PREVIEW_SIZE)

      ctx.translate(OUTPUT_SIZE / 2 + moveX, OUTPUT_SIZE / 2 + moveY)
      ctx.rotate(rad)
      ctx.scale(scale, scale)
      ctx.drawImage(image, -image.width / 2, -image.height / 2)

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((value) => {
          if (!value) {
            reject(new Error("Falha ao processar imagem."))
            return
          }
          resolve(value)
        }, "image/jpeg", 0.9)
      })

      const formData = new FormData()
      formData.append("file", new File([blob], `avatar-${Date.now()}.jpg`, { type: "image/jpeg" }))
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error("Sessão expirada. Faça login novamente.")
      }

      const response = await fetch(buildApiUrl("/api/upload/avatar"), {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error || "Falha ao enviar avatar.")
      }

      setAvatarUrl(payload.url)
      setSourceDataUrl(null)
      onUploaded?.(payload.url)

      toast.success("Foto atualizada com sucesso!")
    } catch (error) {
      toast.error("Erro ao enviar foto", {
        description: error instanceof Error ? error.message : "Tente novamente.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Foto de Perfil</CardTitle>
        <CardDescription>Faça upload e ajuste sua foto antes de salvar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="h-24 w-24 overflow-hidden rounded-full border bg-muted">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar atual" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                Sem foto
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <Label htmlFor="avatar">Selecionar imagem</Label>
            <Input
              ref={fileRef}
              id="avatar"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileChange}
              disabled={loading}
            />
          </div>
        </div>

        {hasSource && (
          <div className="space-y-4 rounded-lg border p-4">
            <div className="mx-auto h-64 w-64 overflow-hidden rounded-xl border bg-muted">
              <img
                src={sourceDataUrl!}
                alt="Pré-visualização do avatar"
                className="h-full w-full object-cover"
                style={previewStyle}
              />
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Zoom</Label>
                <Slider min={1} max={3} step={0.01} value={[zoom]} onValueChange={(v) => setZoom(v[0] || 1)} />
              </div>

              <div className="space-y-2">
                <Label>Rotação</Label>
                <Slider min={-180} max={180} step={1} value={[rotation]} onValueChange={(v) => setRotation(v[0] || 0)} />
              </div>

              <div className="space-y-2">
                <Label>Posição horizontal (corte)</Label>
                <Slider min={-120} max={120} step={1} value={[offsetX]} onValueChange={(v) => setOffsetX(v[0] || 0)} />
              </div>

              <div className="space-y-2">
                <Label>Posição vertical (corte)</Label>
                <Slider min={-120} max={120} step={1} value={[offsetY]} onValueChange={(v) => setOffsetY(v[0] || 0)} />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="button" onClick={handleUploadEdited} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Aplicar e enviar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRotation(0)
                  setZoom(1)
                  setOffsetX(0)
                  setOffsetY(0)
                }}
                disabled={loading}
              >
                <RotateCw className="mr-2 h-4 w-4" />
                Resetar ajustes
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
