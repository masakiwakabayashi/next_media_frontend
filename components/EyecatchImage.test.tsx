import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EyecatchImage from './EyecatchImage'

describe('EyecatchImage', () => {
  it('srcがnullの場合はno_image.pngを表示する', () => {
    render(<EyecatchImage src={null} alt="代替テキスト" />)

    const img = screen.getByAltText('代替テキスト')
    expect(img.getAttribute('src')).toContain(encodeURIComponent('/no_image.png'))
  })

  it('srcが/から始まる場合はそのまま使用する', () => {
    render(<EyecatchImage src="/images/eyecatch.png" alt="ローカル画像" />)

    const img = screen.getByAltText('ローカル画像')
    expect(img.getAttribute('src')).toContain(
      encodeURIComponent('/images/eyecatch.png')
    )
  })

  it('srcがhttpから始まる場合はそのまま使用する', () => {
    render(<EyecatchImage src="https://example.com/foo.png" alt="外部画像" />)

    const img = screen.getByAltText('外部画像')
    expect(img.getAttribute('src')).toBe('https://example.com/foo.png')
  })

  it('srcがストレージの署名付きURLの場合はそのまま使用する', () => {
    const signedUrl =
      'https://example.supabase.co/storage/v1/object/sign/post-images/posts/foo.png?token=abc'
    render(<EyecatchImage src={signedUrl} alt="ストレージ画像" />)

    const img = screen.getByAltText('ストレージ画像')
    expect(img.getAttribute('src')).toBe(signedUrl)
  })

  it('srcが署名されていないオブジェクトキーの場合はno_image.pngを表示する', () => {
    render(<EyecatchImage src="posts/foo.png" alt="未署名画像" />)

    const img = screen.getByAltText('未署名画像')
    expect(img.getAttribute('src')).toContain(encodeURIComponent('/no_image.png'))
  })

  it('画像の読み込みに失敗した場合はno_image.pngにフォールバックする', () => {
    render(<EyecatchImage src="https://example.com/broken.png" alt="失敗画像" />)

    const img = screen.getByAltText('失敗画像')
    fireEvent.error(img)

    expect(img.getAttribute('src')).toContain(encodeURIComponent('/no_image.png'))
  })
})
