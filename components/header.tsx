import { Landmark, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

export function Header() {
  return (
    <header className="flex items-center justify-between p-3 border-b bg-white dark:bg-gray-950 z-10 shadow-sm">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3">
          <Landmark className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">政治資金エクスプローラー</h1>
        </Link>
      </div>

      <nav className="hidden md:flex items-center gap-6">
        <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
          ホーム
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className="text-sm font-medium hover:text-primary transition-colors">
            政治家・政党
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link href="/directory">政治家・政党一覧</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/politicians">政治家検索</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="text-sm font-medium hover:text-primary transition-colors">
            政治データ
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link href="/political-data">政治資金データ</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/fund-flows">資金フロー</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="text-sm font-medium hover:text-primary bg-blue-50 px-2 py-1 rounded transition-colors">
            🧪 テスト
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link href="/test/politicians-search">基本テスト</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/test/politicians-search-improved">改良版テスト</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link href="/admin" className="text-sm font-medium hover:text-primary transition-colors">
          管理画面
        </Link>
      </nav>

      <div className="flex-1 max-w-xl mx-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="政治家、政党、企業名で検索..."
            className="pl-10 bg-gray-50 dark:bg-gray-800"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/docs">APIドキュメント</Link>
        </Button>
        <Avatar>
          <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
