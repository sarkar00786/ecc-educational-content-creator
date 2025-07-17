import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import ContentGenerationPage from '../../components/content/ContentGenerationPage'

describe('ContentGenerationPage Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<ContentGenerationPage />)
    expect(container).toBeInTheDocument()
  })
})
