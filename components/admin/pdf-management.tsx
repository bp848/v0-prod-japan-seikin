"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react" // useCallback を追加
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  FileText,
  Upload,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Info,
  UploadCloud,
} from "lucide-react" // Info, UploadCloud を追加
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils" // cn を追加

interface PdfDocument {
  id: string
  file_name: string
  blob_url?: string
  upload_datetime: string
  party_name: string
  region: string
  status: string
  error_message?: string
  indexing_error_message?: string
  file_size: number
  groq_index_id?: string
  ocr_text?: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function PDFManagement() {
  const [documents, setDocuments] = useState<PdfDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState<Record<string, boolean>>({})
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [isDraggingOver, setIsDraggingOver] = useState(false) // ドラッグ状態の管理

  const [filters, setFilters] = useState({
    status: "all",
    party: "all",
    region: "all",
    search: "",
  })

  const { toast } = useToast()

  const fetchDocuments = useCallback(async () => {
    // useCallback でラップ
    setLoading(true)
    setError(null)
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })
      if (filters.status !== "all") queryParams.append("status", filters.status)
      if (filters.party !== "all") queryParams.append("party", filters.party)
      if (filters.region !== "all") queryParams.append("region", filters.region)
      if (filters.search) queryParams.append("search", filters.search)

      const response = await fetch(`/api/pdf/list?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error(`PDFリスト取得エラー: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || "PDFリスト取得に失敗しました")
      }
      setDocuments(data.documents || [])
      setPagination(data.pagination || pagination) // pagination が null の場合のフォールバックを追加
    } catch (err) {
      console.error("PDFリスト取得エラー:", err)
      setError(err instanceof Error ? err.message : "PDFリストの取得中にエラーが発生しました")
      toast({
        title: "データ取得エラー",
        description: err instanceof Error ? err.message : "PDFリストの取得中にエラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, filters, toast]) // 依存配列を更新

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments]) // fetchDocuments を依存配列に追加

  // 共通のファイルアップロード処理関数
  const processAndUploadFiles = async (filesToProcess: FileList | null) => {
    if (!filesToProcess || filesToProcess.length === 0) return

    setUploading(true)
    let newUploadSuccessCount = 0
    let skippedCount = 0
    let errorCount = 0
    const totalFiles = filesToProcess.length

    toast({
      title: "一括アップロード開始",
      description: `${totalFiles}個のファイルを処理します。`,
    })

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i]
      const currentFileNumber = i + 1
      try {
        if (file.type !== "application/pdf") {
          throw new Error(`ファイル「${file.name}」はPDF形式ではありません。`)
        }
        if (file.size > 50 * 1024 * 1024) {
          // 50MB
          throw new Error(`ファイル「${file.name}」のサイズが50MBを超えています。`)
        }

        const formData = new FormData()
        formData.append("file", file)

        toast({
          title: `処理中 (${currentFileNumber}/${totalFiles})`,
          description: `ファイル「${file.name}」をアップロードしています...`,
        })

        const response = await fetch("/api/pdf/upload", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()

        if (data.isDuplicate) {
          toast({
            title: (
              <div className="flex items-center">
                <Info className="h-4 w-4 mr-2 text-blue-500" />
                スキップ ({currentFileNumber}/{totalFiles})
              </div>
            ),
            description: data.message || `ファイル「${file.name}」は既に存在するためスキップされました。`, // Use data.message
            variant: "default",
          })
          skippedCount++
        } else if (data.success) {
          toast({
            title: (
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                アップロード成功 ({currentFileNumber}/{totalFiles})
              </div>
            ),
            description: `ファイル「${file.name}」: ${data.message}`, // Use data.message from backend
            variant: "default",
          })
          newUploadSuccessCount++
        } else {
          let errorMessage = data.error || `ファイル「${file.name}」のアップロード処理に失敗しました。`
          if (data.details) {
            errorMessage += ` 詳細: ${data.details}`
          }
          throw new Error(errorMessage)
        }
      } catch (err) {
        console.error(`ファイル「${file.name}」の処理エラー:`, err)
        toast({
          title: (
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
              処理エラー ({currentFileNumber}/{totalFiles})
            </div>
          ),
          description: `ファイル「${file.name}」: ${err instanceof Error ? err.message : "処理中にエラーが発生しました"}`,
          variant: "destructive",
        })
        errorCount++
      }
    }

    setUploading(false)
    fetchDocuments() // アップロード後にリストを更新

    let summaryMessage = `${newUploadSuccessCount}個の新規アップロード成功。`
    if (skippedCount > 0) summaryMessage += ` ${skippedCount}個スキップ (重複)。`
    if (errorCount > 0) summaryMessage += ` ${errorCount}個エラー。`
    else summaryMessage += ` ${errorCount}個エラー。`

    toast({
      title: "一括アップロード処理完了",
      description: summaryMessage,
      variant: errorCount > 0 ? "destructive" : "default",
    })
  }

  // ファイル選択ボタンからのアップロード
  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // --- デバッグ用ログここから ---
    if (event.target.files) {
      console.log("選択されたファイル数 (handleFileInputChange):", event.target.files.length)
      console.log("選択されたファイルリスト (handleFileInputChange):", event.target.files)
      toast({
        title: "デバッグ情報: ファイル選択",
        description: `ファイル選択ダイアログで ${event.target.files.length} 個のファイルが選択されました。ブラウザのコンソールで詳細を確認してください。`,
        duration: 9000, // 長めに表示
      })
    } else {
      console.log("ファイルが選択されていません (handleFileInputChange)。")
      toast({
        title: "デバッグ情報: ファイル選択",
        description: "ファイルが選択されていません。",
        variant: "destructive",
      })
    }
    // --- デバッグ用ログここまで ---

    await processAndUploadFiles(event.target.files)
    event.target.value = "" // ファイル選択をリセット
  }

  // ドラッグアンドドロップのハンドラ
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (!uploading) {
      // アップロード中でなければドラッグ状態にする
      setIsDraggingOver(true)
    }
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDraggingOver(false)
  }

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDraggingOver(false)
    if (uploading) return // アップロード中はドロップを無視

    const droppedFiles = event.dataTransfer.files
    if (droppedFiles && droppedFiles.length > 0) {
      await processAndUploadFiles(droppedFiles)
    }
  }

  const handleProcessDocument = async (documentId: string) => {
    setProcessing((prev) => ({ ...prev, [documentId]: true }))
    try {
      const response = await fetch("/api/pdf/index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentIds: [documentId], reprocess: true }),
      })
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || "処理開始に失敗しました")
      }
      const result = data.results?.find((r: any) => r.documentId === documentId)
      toast({
        title: result?.success ? "処理開始" : "処理エラー",
        description: result?.message || result?.error || "処理を開始しました",
        variant: result?.success ? "default" : "destructive",
      })
      setTimeout(() => fetchDocuments(), 2000)
    } catch (err) {
      console.error("処理開始エラー:", err)
      toast({
        title: "処理エラー",
        description: err instanceof Error ? err.message : "処理の開始中にエラーが発生しました",
        variant: "destructive",
      })
    } finally {
      setProcessing((prev) => ({ ...prev, [documentId]: false }))
    }
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            完了
          </Badge>
        )
      case "ocr_failed":
      case "indexing_failed":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="h-3 w-3 mr-1" />
            失敗
          </Badge>
        )
      case "ocr_processing":
      case "indexing_processing":
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            処理中
          </Badge>
        )
      case "pending_upload":
      case "pending":
      case "text_extraction_completed":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Clock className="h-3 w-3 mr-1" />
            待機中
          </Badge>
        )
      default:
        return <Badge variant="outline">{status || "不明"}</Badge>
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return
    setPagination((prev) => ({ ...prev, page: newPage }))
  }

  const applyFilters = () => {
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  if (loading && documents.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">PDF管理</h1>
          <Button disabled>
            <Upload className="h-4 w-4 mr-2" />
            アップロード
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>PDFファイル一覧</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">PDF管理</h1>
        <div className="flex gap-2">
          <Button onClick={() => fetchDocuments()} variant="outline" disabled={loading || uploading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading || uploading ? "animate-spin" : ""}`} />
            更新
          </Button>
          <Label htmlFor="file-upload" className="cursor-pointer">
            <Button asChild disabled={uploading}>
              <div>
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "処理中..." : "ファイルを選択"}
              </div>
            </Button>
          </Label>
          <Input
            id="file-upload"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileInputChange}
            disabled={uploading}
            multiple // 複数ファイル選択を許可
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ドラッグアンドドロップエリア */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ease-in-out",
          isDraggingOver
            ? "border-blue-500 bg-blue-500/10"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
          uploading && "cursor-not-allowed opacity-70",
        )}
      >
        <UploadCloud className={cn("mx-auto h-12 w-12", isDraggingOver ? "text-blue-500" : "text-gray-400")} />
        <p className={cn("mt-2 text-sm", isDraggingOver ? "text-blue-600" : "text-gray-500 dark:text-gray-400")}>
          {uploading
            ? "アップロード処理中です..."
            : isDraggingOver
              ? "ここにファイルをドロップ"
              : "ここにPDFファイルをドラッグ＆ドロップするか、上記のボタンから選択してください。"}
        </p>
        {uploading && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">処理が完了するまでお待ちください。</p>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>PDFファイル一覧</CardTitle>
            <Badge variant="outline">{pagination.total}件</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label htmlFor="status-filter">ステータス</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="すべて" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="completed">完了</SelectItem>
                  <SelectItem value="ocr_processing">OCR処理中</SelectItem>
                  <SelectItem value="indexing_processing">インデックス処理中</SelectItem>
                  <SelectItem value="ocr_failed">OCR失敗</SelectItem>
                  <SelectItem value="indexing_failed">インデックス失敗</SelectItem>
                  <SelectItem value="pending">処理待機中</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="party-filter">政党</Label>
              <Select value={filters.party} onValueChange={(value) => setFilters({ ...filters, party: value })}>
                <SelectTrigger id="party-filter">
                  <SelectValue placeholder="すべて" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="自由民主党">自由民主党</SelectItem>
                  <SelectItem value="立憲民主党">立憲民主党</SelectItem>
                  <SelectItem value="公明党">公明党</SelectItem>
                  <SelectItem value="日本維新の会">日本維新の会</SelectItem>
                  <SelectItem value="日本共産党">日本共産党</SelectItem>
                  <SelectItem value="国民民主党">国民民主党</SelectItem>
                  <SelectItem value="不明">不明</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="region-filter">地域</Label>
              <Select value={filters.region} onValueChange={(value) => setFilters({ ...filters, region: value })}>
                <SelectTrigger id="region-filter">
                  <SelectValue placeholder="すべて" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="東京">東京</SelectItem>
                  <SelectItem value="大阪">大阪</SelectItem>
                  <SelectItem value="北海道">北海道</SelectItem>
                  <SelectItem value="不明">不明</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="search-filter">検索</Label>
                <Input
                  id="search-filter"
                  placeholder="ファイル名で検索"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <Button className="mt-auto" variant="outline" onClick={applyFilters}>
                <Search className="h-4 w-4 mr-2" />
                検索
              </Button>
            </div>
          </div>

          {documents.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ファイル名</TableHead>
                    <TableHead>政党</TableHead>
                    <TableHead>地域</TableHead>
                    <TableHead>アップロード日時</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          {doc.file_name}
                        </div>
                      </TableCell>
                      <TableCell>{doc.party_name}</TableCell>
                      <TableCell>{doc.region}</TableCell>
                      <TableCell>{new Date(doc.upload_datetime).toLocaleString("ja-JP")}</TableCell>
                      <TableCell>{renderStatusBadge(doc.status)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleProcessDocument(doc.id)}
                          disabled={
                            processing[doc.id] ||
                            uploading || // アップロード中も無効化
                            doc.status === "ocr_processing" ||
                            doc.status === "indexing_processing"
                          }
                        >
                          {processing[doc.id] ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                          )}
                          {doc.status === "completed" || doc.status === "ocr_failed" || doc.status === "indexing_failed"
                            ? "再処理"
                            : "処理開始"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            !loading && ( // ローディング中でない場合のみ「ファイルがありません」を表示
              <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">PDFファイルがありません</h3>
                <p className="text-gray-500 mb-4">
                  上記のエリアにファイルをドラッグ＆ドロップするか、「ファイルを選択」ボタンからPDFをアップロードしてください。
                </p>
              </div>
            )
          )}

          {documents.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                {pagination.total}件中 {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)}件を表示
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.page === 1 || uploading}
                >
                  最初
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || uploading}
                >
                  前へ
                </Button>
                <span className="flex items-center px-3">
                  {pagination.page} / {pagination.totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages || uploading}
                >
                  次へ
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={pagination.page === pagination.totalPages || uploading}
                >
                  最後
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
