import { type NextRequest, NextResponse } from "next/server"
import { put, type PutBlobResult } from "@vercel/blob"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// A more streamlined logging function
const log = (level: "INFO" | "ERROR", message: string, data: object = {}) => {
  const logEntry = `[${new Date().toISOString()}] [pdf-upload] ${level}: ${message} ${Object.keys(data).length > 0 ? JSON.stringify(data) : ""}`
  console.log(logEntry)
  // Non-blocking call to save log to DB
  supabase
    .from("system_logs")
    .insert({ level: level.toLowerCase(), component: "pdf-upload", message, data: data ? JSON.stringify(data) : null })
    .then(() => {})
}

export async function POST(request: NextRequest) {
  const uploadId = `upload_${Date.now()}`
  log("INFO", "PDF upload process started.", { uploadId })

  try {
    // 1. Check for required environment variables
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      log("ERROR", "BLOB_READ_WRITE_TOKEN is not set.", { uploadId })
      return NextResponse.json({ error: "Server configuration error: Storage token is missing." }, { status: 500 })
    }

    // 2. Get and validate the file from the form data
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      log("ERROR", "No file provided in the request.", { uploadId })
      return NextResponse.json({ error: "ファイルを選択してください" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      log("ERROR", "Invalid file type.", { uploadId, fileType: file.type })
      return NextResponse.json({ error: "PDFファイルのみアップロード可能です" }, { status: 400 })
    }

    log("INFO", "File received and validated.", { uploadId, fileName: file.name, fileSize: file.size })

    // 3. Upload the file to Vercel Blob
    let blob: PutBlobResult
    try {
      log("INFO", "Uploading to Vercel Blob.", { uploadId, fileName: file.name })
      blob = await put(file.name, file, {
        access: "public",
        addRandomSuffix: true, // Best practice to avoid filename collisions
      })
      log("INFO", "Vercel Blob upload successful.", { uploadId, url: blob.url })
    } catch (error) {
      log("ERROR", "Vercel Blob put operation failed.", {
        uploadId,
        error: error instanceof Error ? error.message : String(error),
      })
      return NextResponse.json(
        { error: "ファイルのストレージへのアップロード中にエラーが発生しました" },
        { status: 500 },
      )
    }

    // 4. Insert metadata into Supabase
    const documentData = {
      file_name: file.name, // Original filename
      blob_url: blob.url, // URL of the stored file
      file_size: file.size,
      status: "pending", // Initial status
      upload_datetime: new Date().toISOString(),
    }

    const { data: dbData, error: dbError } = await supabase.from("pdf_documents").insert(documentData).select().single()

    if (dbError) {
      log("ERROR", "Failed to save file metadata to database.", { uploadId, dbError })
      // Note: At this point, the file is in Blob storage but not in our DB.
      // A cleanup process might be needed for production systems.
      return NextResponse.json({ error: "ファイル情報の保存に失敗しました", details: dbError.message }, { status: 500 })
    }

    log("INFO", "File metadata saved to database.", { uploadId, documentId: dbData.id })

    // 5. (Optional) Trigger OCR processing asynchronously
    // This part remains the same, but it's good practice to not block the response.
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/pdf/index`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentIds: [dbData.id] }),
    }).catch((ocrError) => {
      log("ERROR", "Failed to trigger OCR processing.", { uploadId, documentId: dbData.id, ocrError })
    })

    // 6. Return a success response
    return NextResponse.json({
      success: true,
      message: "ファイルのアップロードが完了しました。処理を開始します。",
      file: {
        id: dbData.id,
        fileName: dbData.file_name,
        fileUrl: dbData.blob_url,
        status: dbData.status,
      },
    })
  } catch (error) {
    log("ERROR", "An unexpected error occurred in the upload process.", {
      uploadId,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "ファイルアップロード中に予期せぬエラーが発生しました" }, { status: 500 })
  }
}
