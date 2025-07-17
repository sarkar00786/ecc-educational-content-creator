import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import MyProfilePage from '../../components/settings/MyProfilePage'

describe('MyProfilePage Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<MyProfilePage />)
    expect(container).toBeInTheDocument()
  })
})
