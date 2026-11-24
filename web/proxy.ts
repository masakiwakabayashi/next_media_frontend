import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/external/database/database.types'

// 認証不要で誰でもアクセスできるパス
const PUBLIC_PATHS = ['/login', '/invite', '/auth', '/forgot-password', '/reset-password']

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() は Supabase Auth サーバーに問い合わせてトークンを検証・更新する。
  // ここで呼び出すことで、期限切れ間近のセッションが Cookie 経由でリフレッシュされる。
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (!user && !isPublicPath(pathname)) {
    const redirectUrl = new URL('/login', request.url)
    const redirectTo = `${pathname}${request.nextUrl.search}`
    if (redirectTo !== '/') {
      redirectUrl.searchParams.set('redirectTo', redirectTo)
    }
    return NextResponse.redirect(redirectUrl)
  }

  if (user && pathname.startsWith('/admin')) {
    const isAdmin = user.app_metadata?.role === 'admin'
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * 以下を除く全てのリクエストパスにマッチする:
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化ファイル)
     * - favicon.ico, robots.txt
     * - 画像等の静的アセット
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
