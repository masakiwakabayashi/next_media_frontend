'use client'

import Image from 'next/image'
import { useState } from 'react'

type Props = {
  src: string | null
  alt: string
}

// src はシード等の public/ 配下の相対パス（"/images/..."）、blob:/data: のプレビュー、
// またはリポジトリで発行した Supabase Storage の署名付きURL（image_url）のいずれか。
// post-images は private バケットのため、オブジェクトキーをここで公開URLに組み立てることはしない。
// ローカルパス以外は next/image の最適化プロキシを経由させない
// （署名付きURLは発行のたびに変わりキャッシュが効かない上、
// ローカル環境の Supabase はループバックIPのため next/image がブロックする）。
function resolveSrc(src: string | null): string {
  if (!src) return '/no_image.png'
  if (src.startsWith('/') || src.startsWith('blob:') || src.startsWith('data:') || src.startsWith('http')) {
    return src
  }
  return '/no_image.png'
}

export default function EyecatchImage({ src, alt }: Props) {
  const [prevSrc, setPrevSrc] = useState(src)
  const [imgSrc, setImgSrc] = useState(() => resolveSrc(src))

  if (src !== prevSrc) {
    setPrevSrc(src)
    setImgSrc(resolveSrc(src))
  }

  return (
    <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-lg">
      <Image
        key={src}
        src={imgSrc}
        alt={alt}
        fill
        sizes="100vw"
        unoptimized={!imgSrc.startsWith('/')}
        className="object-cover"
        onError={() => setImgSrc('/no_image.png')}
      />
    </div>
  )
}
