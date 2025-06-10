import PoliticiansSearchTest from "@/components/test/politicians-search-test"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TestTube, Database, Search, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function PoliticiansSearchTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* ページヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <TestTube className="h-8 w-8 text-blue-600" />
                <h1 className="text-4xl font-bold text-gray-900">政治家検索・フィルター機能テスト</h1>
              </div>
              <p className="text-lg text-gray-600 max-w-3xl">
                政治家検索APIの各種機能を自動テストし、検索・フィルタリング・ソート・ページネーション機能の動作確認を行います。
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link href="/politicians">政治家一覧へ</Link>
              </Button>
              <Button asChild>
                <Link href="/test/politicians-search-improved">
                  改良版テスト <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* テスト概要カード */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">テスト対象API</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">/api/politicians</div>
              <p className="text-xs text-muted-foreground">政治家データ取得API</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">テスト項目数</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">包括的なテストケース</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">テスト機能</CardTitle>
              <TestTube className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">自動実行</div>
              <p className="text-xs text-muted-foreground">リアルタイム結果表示</p>
            </CardContent>
          </Card>
        </div>

        {/* メインテストコンポーネント */}
        <PoliticiansSearchTest />

        {/* 使用方法 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>使用方法</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>「全テスト実行」ボタンをクリックして、すべてのテストケースを一括実行</li>
              <li>個別のテストケースを実行したい場合は、各テストケースの「実行」ボタンをクリック</li>
              <li>テスト結果は成功・失敗・実行時間とともにリアルタイムで表示されます</li>
              <li>詳細データを確認したい場合は、「詳細データ」をクリックして展開</li>
              <li>「結果クリア」ボタンで表示されている結果をクリアできます</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
