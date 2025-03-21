import './globals.css'
import { Inter } from 'next/font/google'
import { ConfigProvider } from '@/lib/config-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'LiteLLM Admin Portal',
  description: 'Administrative interface for LiteLLM',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConfigProvider>
          <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center">
                      <span className="text-xl font-bold">LiteLLM Admin</span>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                      <a href="/" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900">
                        Dashboard
                      </a>
                      <a href="/teams" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">
                        Teams
                      </a>
                      <a href="/users" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">
                        Users
                      </a>
                      <a href="/keys" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">
                        Keys
                      </a>
                      <a href="/models" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">
                        Models
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </nav>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </ConfigProvider>
      </body>
    </html>
  )
}
