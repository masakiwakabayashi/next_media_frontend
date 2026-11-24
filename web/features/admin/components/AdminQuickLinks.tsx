import Link from 'next/link'

type QuickLinkProps = {
  href: string
  label: string
}

function QuickLinkCard({ href, label }: QuickLinkProps) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-zinc-200 bg-white p-6 text-center text-sm font-semibold text-zinc-900 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
    >
      {label}
    </Link>
  )
}

const links: QuickLinkProps[] = [
  { href: '/admin/posts/new', label: '記事を作成' },
  { href: '/admin/posts/drafts', label: '下書き一覧' },
  { href: '/admin/collections/new', label: '特集を作成' },
  { href: '/admin/tags', label: 'タグ管理' },
  { href: '/admin/users', label: 'ユーザー管理' },
]

export default function AdminQuickLinks() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {links.map((link) => (
        <QuickLinkCard key={link.href} {...link} />
      ))}
    </div>
  )
}
