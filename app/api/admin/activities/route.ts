import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    // システムログから最近のアクティビティを取得
    const { data: logs, error } = await supabase
      .from("system_logs")
      .select("*")
      .order("created_at", { ascending: false }) // Assuming 'created_at' is the correct timestamp column
      .limit(10)

    if (error) throw error

    // アクティビティに変換
    const activities = logs.map((log) => {
      // 経過時間を計算
      const logTime = new Date(log.created_at) // Ensure this column name is correct
      const now = new Date()
      const diffMs = now.getTime() - logTime.getTime()
      const diffMins = Math.floor(diffMs / 60000)

      let timeText
      if (diffMins < 60) {
        timeText = `${diffMins}分前`
      } else if (diffMins < 1440) {
        timeText = `${Math.floor(diffMins / 60)}時間前`
      } else {
        timeText = `${Math.floor(diffMins / 1440)}日前`
      }

      // アクティビティタイプを決定
      let type: "info" | "success" | "warning" | "error" = "info"
      if (log.level === "error") {
        type = "error"
      } else if (log.level === "warning") {
        type = "warning"
      } else if (log.message && (log.message.includes("完了") || log.message.includes("成功"))) {
        // Added null check for log.message
        type = "success"
      }

      // アクションテキストを生成
      const messageContent = log.message || "詳細不明" // Fallback for null message
      let action = messageContent
      if (log.component === "pdf-upload") {
        action = `PDFアップロード: ${messageContent}`
      } else if (log.component === "pdf-ocr") {
        action = `OCR処理: ${messageContent}`
      } else if (log.component === "ai-chat") {
        action = `AIチャット: ${messageContent}`
      }

      return {
        time: timeText,
        action,
        type,
      }
    })

    return NextResponse.json({
      success: true,
      activities,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("アクティビティ取得エラー:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "アクティビティ情報の取得に失敗しました",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
