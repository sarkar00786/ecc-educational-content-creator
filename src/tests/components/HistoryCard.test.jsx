import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HistoryCard from '../../components/history/HistoryCard'

describe('HistoryCard Component', () => {
  const mockContent = {
    id: 'test-content-id',
    name: 'Test Content',
    generatedContent: 'This is a test content that should be displayed in the history card. It contains educational material about science topics and various complex concepts that students need to understand. The content is deliberately long to test the truncation functionality that should occur when the content exceeds 200 characters in length. This ensures that users see a preview of the content without the card becoming too large.',
    audienceClass: 'Grade 5',
    audienceAge: '10-11',
    audienceRegion: 'United States',
    timestamp: {
      toDate: () => new Date('2024-01-01T12:00:00Z')
    }
  }

  const mockProps = {
    content: mockContent,
    onClick: vi.fn(),
    onLoadToEditor: vi.fn(),
    onDelete: vi.fn(),
    isSelected: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    const { container } = render(<HistoryCard {...mockProps} />)
    expect(container).toBeInTheDocument()
  })

  it('displays content name and timestamp', () => {
    render(<HistoryCard {...mockProps} />)
    
    expect(screen.getByText('Test Content')).toBeInTheDocument()
    expect(screen.getByText(/1\/1\/2024/)).toBeInTheDocument()
  })

  it('displays audience information as tags', () => {
    render(<HistoryCard {...mockProps} />)
    
    expect(screen.getByText('Grade 5')).toBeInTheDocument()
    expect(screen.getByText('Age: 10-11')).toBeInTheDocument()
    expect(screen.getByText('United States')).toBeInTheDocument()
  })

  it('shows content preview truncated to 200 characters', () => {
    render(<HistoryCard {...mockProps} />)
    
    const preview = screen.getByText(/This is a test content/)
    expect(preview.textContent).toContain('...')
    expect(preview.textContent.length).toBeLessThanOrEqual(203) // 200 + '...'
  })

  it('handles content without name gracefully', () => {
    const contentWithoutName = { ...mockContent, name: null }
    const propsWithoutName = { ...mockProps, content: contentWithoutName }
    
    render(<HistoryCard {...propsWithoutName} />)
    expect(screen.getByText('Untitled Content')).toBeInTheDocument()
  })

  it('handles content without timestamp gracefully', () => {
    const contentWithoutTimestamp = { ...mockContent, timestamp: null }
    const propsWithoutTimestamp = { ...mockProps, content: contentWithoutTimestamp }
    
    render(<HistoryCard {...propsWithoutTimestamp} />)
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('calls onClick when card is clicked', async () => {
    const user = userEvent.setup()
    const { container } = render(<HistoryCard {...mockProps} />)
    
    const card = container.firstChild
    await user.click(card)
    
    expect(mockProps.onClick).toHaveBeenCalled()
  })

  it('calls onLoadToEditor when Load button is clicked', async () => {
    const user = userEvent.setup()
    render(<HistoryCard {...mockProps} />)
    
    const loadButton = screen.getByText('Load')
    await user.click(loadButton)
    
    expect(mockProps.onLoadToEditor).toHaveBeenCalled()
    expect(mockProps.onClick).not.toHaveBeenCalled() // Should not trigger card click
  })

  it('calls onDelete when Delete button is clicked', async () => {
    const user = userEvent.setup()
    render(<HistoryCard {...mockProps} />)
    
    const deleteButton = screen.getByText('Delete')
    await user.click(deleteButton)
    
    expect(mockProps.onDelete).toHaveBeenCalled()
    expect(mockProps.onClick).not.toHaveBeenCalled() // Should not trigger card click
  })

  it('calls onClick when View Details button is clicked', async () => {
    const user = userEvent.setup()
    render(<HistoryCard {...mockProps} />)
    
    const viewDetailsButton = screen.getByText('View Details →')
    await user.click(viewDetailsButton)
    
    expect(mockProps.onClick).toHaveBeenCalled()
  })

  it('shows selected state styling when isSelected is true', () => {
    const selectedProps = { ...mockProps, isSelected: true }
    const { container } = render(<HistoryCard {...selectedProps} />)
    
    const card = container.firstChild
    expect(card).toHaveClass('border-blue-500')
    expect(card).toHaveClass('ring-2')
    expect(card).toHaveClass('bg-blue-50')
  })

  it('shows normal state styling when isSelected is false', () => {
    const { container } = render(<HistoryCard {...mockProps} />)
    
    const card = container.firstChild
    expect(card).toHaveClass('border-gray-200')
    expect(card).not.toHaveClass('border-blue-500')
  })

  it('does not render delete button when onDelete is not provided', () => {
    const propsWithoutDelete = { ...mockProps, onDelete: undefined }
    render(<HistoryCard {...propsWithoutDelete} />)
    
    expect(screen.queryByText('Delete')).not.toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<HistoryCard {...mockProps} />)
    
    const loadButton = screen.getByRole('button', { name: /load/i })
    const deleteButton = screen.getByRole('button', { name: /delete/i })
    
    expect(loadButton).toHaveAttribute('title', 'Load to Editor')
    expect(deleteButton).toHaveAttribute('title', 'Delete Content')
  })

  it('prevents event bubbling on action buttons', async () => {
    const user = userEvent.setup()
    render(<HistoryCard {...mockProps} />)
    
    const loadButton = screen.getByText('Load')
    await user.click(loadButton)
    
    // onClick should not be called when clicking action buttons
    expect(mockProps.onClick).not.toHaveBeenCalled()
    expect(mockProps.onLoadToEditor).toHaveBeenCalled()
  })

  it('displays content preview even when content is short', () => {
    const shortContent = { ...mockContent, generatedContent: 'Short content' }
    const propsWithShortContent = { ...mockProps, content: shortContent }
    
    render(<HistoryCard {...propsWithShortContent} />)
    
    expect(screen.getByText('Short content')).toBeInTheDocument()
    expect(screen.queryByText('...')).not.toBeInTheDocument()
  })

  it('handles missing content gracefully', () => {
    const emptyContent = { ...mockContent, generatedContent: null }
    const propsWithEmptyContent = { ...mockProps, content: emptyContent }
    
    render(<HistoryCard {...propsWithEmptyContent} />)
    
    expect(screen.getByText('No content available')).toBeInTheDocument()
  })
})
