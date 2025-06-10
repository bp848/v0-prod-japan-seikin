// Changed from default export to named export
export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-[#0d0f17]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              +Program
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              政治資金の透明化を通じて、より開かれた民主主義社会の実現を目指します。
            </p>
            <div className="flex space-x-4">
              {/* Placeholder for Twitter/X Icon */}
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-twitter"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 1.4 3.3 4.3 3.3 9.5 0 1.2-.3 2.3-.8 3.5-.7 1-1.7 1.8-3 2.3H12c-1.1 0-2.2-.5-3-1.2-.8-.7-1.5-1.8-1.5-3v-.3c0-.2 0-.5.1-.7.1-.2.2-.4.3-.6.2-.2.3-.3.5-.4.2-.1.4-.1.6-.1H10c.2 0 .4 0 .6.1.2.1.3.2.5.4.1.2.2.4.3.6.1.2.1.5.1.7v.3c0 .7.2 1.2.5 1.7.3.4.7.7 1.2.9h.3c.5 0 1-.2 1.3-.5.4-.3.6-.7.7-1.2v-.2c0-.2 0-.4-.1-.6s-.2-.4-.3-.5c-.2-.2-.3-.3-.5-.4-.2-.1-.4-.1-.6-.1H12c-.5 0-1-.2-1.4-.5C10.2 18.8 10 18.3 10 17.7v-.2c0-1.7.8-3.2 2.2-4.4.7-.6 1.5-1.1 2.4-1.5.9-.4 1.8-.7 2.8-1 .2-.1.3-.1.5-.1h.2c.2 0 .4.1.6.2.2.1.3.3.4.5.1.2.1.4.1.6v.5c0 .8-.2 1.5-.5 2.1-.3.6-.8 1.1-1.4 1.5z" />
                </svg>
              </a>
              {/* Placeholder for GitHub Icon */}
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-github"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">リソース</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors">
                  ドキュメント
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors">
                  API リファレンス
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors">
                  データソース
                </a>
              </li>
              <li>
                <a href="/admin" className="text-gray-300 hover:text-cyan-400 transition-colors">
                  管理画面
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">プロジェクト</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors">
                  チームについて
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors">
                  ビジョン
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors">
                  協力団体
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">法的情報</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors">
                  利用規約
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors">
                  プライバシーポリシー
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors">
                  お問い合わせ
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">&copy; 2025 +Program. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <p className="text-xs text-gray-500">データは政治資金収支報告書に基づいています。</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
