import { streamText, type CoreMessage } from "ai"
import { OpenAI } from "@ai-sdk/openai"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Initialize OpenAI and Supabase clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
})
const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
)

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  })
}

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: CoreMessage[] } = await req.json()

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400, headers: corsHeaders })
    }

    const lastUserMessage = messages[messages.length - 1]?.content
    if (typeof lastUserMessage !== "string") {
      return NextResponse.json({ error: "Invalid last message content" }, { status: 400, headers: corsHeaders })
    }

    // Asynchronously search for context from Supabase
    const [pdfDocs, fundFlows, politicians] = await Promise.all([
      supabase
        .from("pdf_documents")
        .select("title, content")
        .or(`content.ilike.%${lastUserMessage}%,title.ilike.%${lastUserMessage}%`)
        .limit(3),
      supabase
        .from("political_fund_flow")
        .select("purpose, recipient")
        .or(`purpose.ilike.%${lastUserMessage}%,recipient.ilike.%${lastUserMessage}%`)
        .limit(3),
      supabase
        .from("politicians")
        .select("name, party, position")
        .or(`name.ilike.%${lastUserMessage}%,name_kana.ilike.%${lastUserMessage}%,party.ilike.%${lastUserMessage}%`)
        .limit(3),
    ])

    const context = `
      Context from PDF documents:
      ${(pdfDocs.data || []).map((doc) => `Title: ${doc.title}\nContent: ${doc.content.substring(0, 200)}...`).join("\n---\n")}

      Context from Political Fund Flows:
      ${(fundFlows.data || []).map((flow) => `Purpose: ${flow.purpose}, Recipient: ${flow.recipient}`).join("\n---\n")}

      Context from Politicians:
      ${(politicians.data || []).map((p) => `Name: ${p.name}, Party: ${p.party}, Position: ${p.position}`).join("\n---\n")}
    `

    const systemPrompt = `
      You are an expert assistant specializing in Japanese political data.
      Answer the user's question based *only* on the provided context below.
      If the context does not contain the answer, state that you could not find the information.
      Do not use any prior knowledge.
      Context:
      ${context}
    `

    const result = await streamText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      messages,
    })

    // Return the streaming response
    return result.toAIStreamResponse({ headers: corsHeaders })
  } catch (error: any) {
    console.error("Chat API Error:", error)
    return NextResponse.json(
      { error: "An internal error occurred", details: error.message },
      { status: 500, headers: corsHeaders },
    )
  }
}
