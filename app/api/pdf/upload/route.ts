import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-client" // Using admin client for backend operations
import { v4 as uuidv4 } from "uuid"
import crypto from "crypto"
import { put, type PutBlobResult } from "@vercel/blob" // Import Vercel Blob's put function and PutBlobResult type

async function calculateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hash = crypto.createHash("sha256")
  hash.update(Buffer.from(buffer))
  return hash.digest("hex")
}

function extractFileInfoFromName(fileName: string): {
  partyName: string | null
  region: string | null
  year: number | null
} {
  let partyName: string | null = null
  let region: string | null = null
  let year: number | null = null

  const complexMatch = fileName.match(/^(?:[\d]+_)?([^_]+)_(?:支部_)?([^_]+)_(\d{4})_/)
  if (complexMatch) {
    partyName = complexMatch[1].replace(/(党|本部|支部)$/, "") || "不明"
    region = complexMatch[2] || "不明"
    year = Number.parseInt(complexMatch[3], 10)
  } else {
    const parts = fileName.split(/[_（]/)
    if (parts.length > 1) {
      if (parts[0].includes("党") || parts[0].includes("会")) partyName = parts[0]
      const regionKeywords = ["東京", "大阪", "北海道", "沖縄", "福岡", "愛知", "神奈川", "埼玉", "千葉", "兵庫"]
      for (const kw of regionKeywords) {
        if (fileName.toLowerCase().includes(kw.toLowerCase())) {
          region = kw
          break
        }
      }
    }
    const yearMatch = fileName.match(/(\d{4})/)
    if (yearMatch && yearMatch[1]) {
      const parsedYear = Number.parseInt(yearMatch[1], 10)
      if (parsedYear > 1900 && parsedYear < 2100) {
        year = parsedYear
      }
    }
  }

  if (!partyName) {
    if (fileName.toLowerCase().includes("自由民主党") || fileName.toLowerCase().includes("自民"))
      partyName = "自由民主党"
    else if (fileName.toLowerCase().includes("公明党")) partyName = "公明党"
    else if (fileName.toLowerCase().includes("立憲民主党") || fileName.toLowerCase().includes("立憲"))
      partyName = "立憲民主党"
    else if (fileName.toLowerCase().includes("日本維新の会") || fileName.toLowerCase().includes("維新"))
      partyName = "日本維新の会"
    else if (fileName.toLowerCase().includes("日本共産党") || fileName.toLowerCase().includes("共産"))
      partyName = "日本共産党"
    else if (fileName.toLowerCase().includes("国民民主党")) partyName = "国民民主党"
  }

  return {
    partyName: partyName || "不明",
    region: region || "不明",
    year: year,
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("Vercel Blob token (BLOB_READ_WRITE_TOKEN) is not configured.")
      return NextResponse.json(
        { success: false, error: "File storage service is not configured on the server." },
        { status: 500 },
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: "ファイルが提供されていません。" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ success: false, error: "PDFファイルのみアップロード可能です。" }, { status: 400 })
    }

    // Vercel Blob has a default limit of 500MB, but serverless functions might have smaller payload limits.
    // The frontend check is 50MB, which should be fine.
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "ファイルサイズは50MB以下にしてください。" }, { status: 413 }) // 413 Payload Too Large
    }

    const fileName = file.name
    const fileSize = file.size
    const fileHash = await calculateFileHash(file)

    const { data: existingDoc, error: existingDocError } = await supabaseAdmin
      .from("pdf_documents")
      .select("id, file_name, status")
      .eq("file_hash", fileHash)
      .single()

    if (existingDocError && existingDocError.code !== "PGRST116") {
      console.error("Supabase select error (checking hash):", existingDocError)
      return NextResponse.json(
        { success: false, error: "既存ファイルの確認中にエラーが発生しました。", details: existingDocError.message },
        { status: 500 },
      )
    }

    if (existingDoc) {
      return NextResponse.json(
        {
          success: true,
          isDuplicate: true,
          message: `ファイル「${fileName}」は既に「${existingDoc.file_name}」として存在します (ステータス: ${existingDoc.status})。`,
          documentId: existingDoc.id,
        },
        { status: 200 },
      )
    }

    let blobResult: PutBlobResult
    try {
      const blobPathname = `pdfs/${uuidv4()}-${fileName}`
      blobResult = await put(blobPathname, file, {
        access: "public",
        // Vercel Blob's `put` function handles multipart uploads for larger files automatically.
        // No specific `contentType` needed for `File` objects, it's inferred.
      })
    } catch (blobError: any) {
      console.error("Vercel Blob upload error:", blobError)
      let errorDetail = "不明なストレージエラー"
      if (blobError.message) {
        errorDetail = blobError.message
      }
      // Check if the error response from Vercel Blob might be non-JSON
      if (typeof blobError.response?.text === "function") {
        try {
          const errorText = await blobError.response.text()
          console.error("Vercel Blob error response text:", errorText)
          // If the error text hints at "Request Entity Too Large" or similar, it might be the cause
          if (errorText.toLowerCase().includes("request entity too large")) {
            return NextResponse.json(
              {
                success: false,
                error: "ファイルサイズがストレージサービスの上限を超えている可能性があります。",
                details: errorDetail,
              },
              { status: 413 }, // Payload Too Large
            )
          }
        } catch (textError) {
          console.error("Could not get text from Vercel Blob error response:", textError)
        }
      }
      return NextResponse.json(
        { success: false, error: "ファイルストレージへのアップロードに失敗しました。", details: errorDetail },
        { status: 500 },
      )
    }

    const blobUrl = blobResult.url // Ensure blobResult is defined and has url

    const { partyName, region, year } = extractFileInfoFromName(fileName)
    const documentId = uuidv4()

    const { data: newDocument, error: insertError } = await supabaseAdmin
      .from("pdf_documents")
      .insert([
        {
          id: documentId,
          file_name: fileName,
          file_size: fileSize,
          file_hash: fileHash,
          blob_url: blobUrl,
          status: "pending",
          upload_datetime: new Date().toISOString(),
          party_name: partyName,
          region: region,
          year: year,
        },
      ])
      .select()
      .single()

    if (insertError) {
      console.error("Supabase insert error:", insertError)
      console.warn(`Database insert failed for ${fileName}. Blob at ${blobUrl} might need manual deletion.`)
      return NextResponse.json(
        { success: false, error: "ファイル情報の保存に失敗しました。", details: insertError.message },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        isDuplicate: false,
        message: `ファイル「${fileName}」が正常にアップロードされ、処理待機中です。`,
        document: newDocument,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Unhandled error in POST /api/pdf/upload:", error)
    let errorMessage = "ファイルのアップロード中に予期せぬサーバーエラーが発生しました。"
    if (error.message) {
      errorMessage += ` 詳細: ${error.message}`
    }
    // Ensure a JSON response even for unexpected errors
    return NextResponse.json(
      { success: false, error: errorMessage, details: error.stack }, // Include stack in dev for more info
      { status: 500 },
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
