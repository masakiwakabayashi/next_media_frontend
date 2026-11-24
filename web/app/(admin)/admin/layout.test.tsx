import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdminLayout from './layout'

describe('AdminLayout', () => {
  it('renders children as-is', () => {
    render(
      <AdminLayout>
        <div>child content</div>
      </AdminLayout>
    )
    expect(screen.getByText('child content')).toBeInTheDocument()
  })
})
