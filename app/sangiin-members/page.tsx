"use client"

import SangiinMembersList from "@/components/sangiin-members-list"

export default function SangiinMembersPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">参議院議員データベース</h1>
        <p className="text-muted-foreground">
          参議院公式ウェブサイトから取得した議員情報を検索・参照できます。
          最新データの取得や詳細な検索・フィルタリング機能を提供します。
        </p>
      </div>

      <SangiinMembersList />
    </div>
  )
}
