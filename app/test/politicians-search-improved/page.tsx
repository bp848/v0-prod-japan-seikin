import PoliticiansSearchTestFixed from "@/components/test/politicians-search-test-fixed"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TestTube, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PoliticiansSearchTestImprovedPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* ページヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <TestTube className="h-8 w-8 text-green-600" />
                <h1 className="text-4xl font-bold text-gray-900">政治家検索テスト（改良版）</h1>
              </div>
              <p className="text-lg text-gray-600 max-w-3xl">
                実際のデータベースに基づいて動的に生成されたテストケースで、政治家検索APIの機能を検証します。
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link href="/test/politicians-search">
                  <ArrowLeft className="mr-2 h-4 w-4" /> 基本テスト
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/politicians">政治家一覧へ</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* 改良点 */}
        <Card className="mb-8 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              改良版の特徴
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-green-700">
              <li>• 実際のデータベースから政治家・政党・選挙区情報を取得</li>
              <li>• 存在するデータに基づいてテストケースを動的生成</li>
              <li>• より現実的で信頼性の高いテスト結果</li>
              <li>• APIレスポンス形式の詳細検証</li>
              <li>• 実データ統計情報の表示</li>
            </ul>
          </CardContent>
        </Card>

        {/* メインテストコンポーネント */}
        <PoliticiansSearchTestFixed />
      </div>
    </div>
  )
}
