import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import type { Session } from '@supabase/supabase-js'
import { AuthProvider, useAuth } from './AuthProvider'
import {
  getSession,
  onAuthStateChange,
  signOut,
} from '@/external/repositories/authRepository'
import { getDisplayName } from '@/external/repositories/profileRepository'

vi.mock('@/external/repositories/authRepository', () => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('@/external/repositories/profileRepository', () => ({
  getDisplayName: vi.fn(),
}))

function makeSession(overrides?: { id?: string; role?: string }): Session {
  const { id = 'user-1', role } = overrides ?? {}
  return {
    access_token: 'token',
    refresh_token: 'refresh',
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id,
      aud: 'authenticated',
      app_metadata: role ? { role } : {},
      user_metadata: {},
      created_at: '2024-01-01T00:00:00Z',
    },
  } as unknown as Session
}

/** onAuthStateChange のコールバックを捕捉し、テストから任意に発火できるようにする */
function setupAuthListener() {
  const unsubscribe = vi.fn()
  let handler: Parameters<typeof onAuthStateChange>[0] = () => {}
  vi.mocked(onAuthStateChange).mockImplementation((cb) => {
    handler = cb
    return unsubscribe
  })
  return {
    unsubscribe,
    emit: (session: Session | null) => handler('SIGNED_IN', session),
  }
}

function Probe() {
  const { user, loading, isAdmin, displayName, refreshDisplayName, signOut: doSignOut } =
    useAuth()
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="isAdmin">{String(isAdmin)}</span>
      <span data-testid="user">{user?.id ?? 'none'}</span>
      <span data-testid="displayName">{displayName ?? 'none'}</span>
      <button onClick={() => refreshDisplayName()}>refresh</button>
      <button onClick={() => doSignOut()}>signout</button>
    </div>
  )
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getSession).mockResolvedValue(null)
  vi.mocked(onAuthStateChange).mockReturnValue(vi.fn())
  vi.mocked(getDisplayName).mockResolvedValue(null)
})

describe('AuthProvider', () => {
  it('初期表示は loading=true で、getSession 解決後に loading=false になる', async () => {
    let resolveSession: (s: Session | null) => void = () => {}
    vi.mocked(getSession).mockReturnValue(
      new Promise((resolve) => {
        resolveSession = resolve
      }),
    )

    renderWithProvider()
    expect(screen.getByTestId('loading')).toHaveTextContent('true')

    await act(async () => {
      resolveSession(null)
    })
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
  })

  it('管理者ロールのセッションでは isAdmin が true になる', async () => {
    vi.mocked(getSession).mockResolvedValue(makeSession({ role: 'admin' }))

    renderWithProvider()

    await waitFor(() =>
      expect(screen.getByTestId('isAdmin')).toHaveTextContent('true'),
    )
  })

  it('ロールを持たないセッションでは isAdmin が false になる', async () => {
    vi.mocked(getSession).mockResolvedValue(makeSession())

    renderWithProvider()

    await waitFor(() =>
      expect(screen.getByTestId('user')).toHaveTextContent('user-1'),
    )
    expect(screen.getByTestId('isAdmin')).toHaveTextContent('false')
  })

  it('セッションがあるとき getDisplayName の結果を displayName に反映する', async () => {
    vi.mocked(getSession).mockResolvedValue(makeSession({ id: 'user-1' }))
    vi.mocked(getDisplayName).mockResolvedValue('たろう')

    renderWithProvider()

    await waitFor(() =>
      expect(screen.getByTestId('displayName')).toHaveTextContent('たろう'),
    )
    expect(getDisplayName).toHaveBeenCalledWith('user-1')
  })

  it('セッションが無いときは getDisplayName を呼ばず displayName は null のまま', async () => {
    vi.mocked(getSession).mockResolvedValue(null)

    renderWithProvider()

    await waitFor(() =>
      expect(screen.getByTestId('loading')).toHaveTextContent('false'),
    )
    expect(getDisplayName).not.toHaveBeenCalled()
    expect(screen.getByTestId('displayName')).toHaveTextContent('none')
  })

  it('onAuthStateChange のコールバックで user と displayName が更新される', async () => {
    const listener = setupAuthListener()
    vi.mocked(getSession).mockResolvedValue(null)
    vi.mocked(getDisplayName).mockResolvedValue('はなこ')

    renderWithProvider()
    await waitFor(() =>
      expect(screen.getByTestId('loading')).toHaveTextContent('false'),
    )

    await act(async () => {
      listener.emit(makeSession({ id: 'user-2' }))
    })

    await waitFor(() =>
      expect(screen.getByTestId('user')).toHaveTextContent('user-2'),
    )
    await waitFor(() =>
      expect(screen.getByTestId('displayName')).toHaveTextContent('はなこ'),
    )
  })

  it('ログイン中のユーザーが居なくなると displayName が null に戻る', async () => {
    const listener = setupAuthListener()
    vi.mocked(getSession).mockResolvedValue(makeSession({ id: 'user-1' }))
    vi.mocked(getDisplayName).mockResolvedValue('たろう')

    renderWithProvider()
    await waitFor(() =>
      expect(screen.getByTestId('displayName')).toHaveTextContent('たろう'),
    )

    await act(async () => {
      listener.emit(null)
    })

    await waitFor(() =>
      expect(screen.getByTestId('displayName')).toHaveTextContent('none'),
    )
  })

  it('refreshDisplayName でセッションユーザーの displayName を再取得する', async () => {
    vi.mocked(getSession).mockResolvedValue(makeSession({ id: 'user-1' }))
    vi.mocked(getDisplayName).mockResolvedValue('初期名')

    renderWithProvider()
    await waitFor(() =>
      expect(screen.getByTestId('displayName')).toHaveTextContent('初期名'),
    )

    vi.mocked(getDisplayName).mockResolvedValue('更新後')
    await act(async () => {
      fireEvent.click(screen.getByText('refresh'))
    })

    await waitFor(() =>
      expect(screen.getByTestId('displayName')).toHaveTextContent('更新後'),
    )
  })

  it('signOut はリポジトリの signOut を呼び出す', async () => {
    vi.mocked(getSession).mockResolvedValue(makeSession({ id: 'user-1' }))

    renderWithProvider()
    await waitFor(() =>
      expect(screen.getByTestId('user')).toHaveTextContent('user-1'),
    )

    await act(async () => {
      fireEvent.click(screen.getByText('signout'))
    })

    expect(signOut).toHaveBeenCalledTimes(1)
  })

  it('アンマウント時に onAuthStateChange の購読を解除する', async () => {
    const listener = setupAuthListener()
    vi.mocked(getSession).mockResolvedValue(null)

    const { unmount } = renderWithProvider()
    await waitFor(() =>
      expect(screen.getByTestId('loading')).toHaveTextContent('false'),
    )

    unmount()
    expect(listener.unsubscribe).toHaveBeenCalledTimes(1)
  })

  it('AuthProvider の外で useAuth を呼ぶとエラーを投げる', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<Probe />)).toThrow(
      'useAuth must be used within AuthProvider',
    )

    consoleError.mockRestore()
  })
})
