

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-16 py-8 sm:flex-row sm:justify-between">
        <p className="text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} Masaki Wakabayashi
        </p>

      </div>
    </footer>
  )
}
