import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react';
// fireEvent imported but not used - commented out
import userEvent from '@testing-library/user-event'
import Modal from '../../components/common/Modal'

describe('Modal Component', () => {
  const mockOnClose = vi.fn()
  const mockOnConfirm = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when message is empty', () => {
    const { container } = render(<Modal message="" onClose={mockOnClose} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders success modal correctly', () => {
    render(
      <Modal 
        message="Operation completed successfully" 
        type="success" 
        onClose={mockOnClose} 
      />
    )
    
    expect(screen.getByText('Success!')).toBeInTheDocument()
    expect(screen.getByText('Operation completed successfully')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('renders error modal correctly', () => {
    render(
      <Modal 
        message="Something went wrong" 
        type="error" 
        onClose={mockOnClose} 
      />
    )
    
    expect(screen.getByText('Error!')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('renders confirmation modal correctly', () => {
    render(
      <Modal 
        message="Are you sure you want to delete this item?" 
        type="confirmation" 
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        onClose={mockOnClose} 
      />
    )
    
    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('uses custom title when provided', () => {
    render(
      <Modal 
        message="Custom message" 
        type="confirmation"
        title="Custom Title"
        onConfirm={mockOnConfirm}
        onClose={mockOnClose} 
      />
    )
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument()
    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument()
  })

  it('uses custom button text when provided', () => {
    render(
      <Modal 
        message="Delete this item?" 
        type="confirmation"
        confirmText="Delete Now"
        cancelText="Keep It"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        onClose={mockOnClose} 
      />
    )
    
    expect(screen.getByRole('button', { name: /delete now/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /keep it/i })).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <Modal 
        message="Test message" 
        type="success" 
        onClose={mockOnClose} 
      />
    )
    
    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <Modal 
        message="Confirm this action?" 
        type="confirmation"
        onConfirm={mockOnConfirm}
        onClose={mockOnClose} 
      />
    )
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    await user.click(confirmButton)
    
    expect(mockOnConfirm).toHaveBeenCalled()
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <Modal 
        message="Confirm this action?" 
        type="confirmation"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        onClose={mockOnClose} 
      />
    )
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)
    
    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('calls onClose when cancel button is clicked and onCancel is not provided', async () => {
    const user = userEvent.setup()
    render(
      <Modal 
        message="Confirm this action?" 
        type="confirmation"
        onConfirm={mockOnConfirm}
        onClose={mockOnClose} 
      />
    )
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('shows loading state on confirmation modal', () => {
    render(
      <Modal 
        message="Processing..." 
        type="confirmation"
        isLoading={true}
        confirmText="Save"
        onConfirm={mockOnConfirm}
        onClose={mockOnClose} 
      />
    )
    
    const confirmButton = screen.getByRole('button', { name: /save/i })
    expect(confirmButton).toBeDisabled()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
    
    // Check for loading spinner
    const spinner = confirmButton.querySelector('svg')
    expect(spinner).toBeInTheDocument()
  })

  it('applies custom confirm button styling', () => {
    render(
      <Modal 
        message="Delete this item?" 
        type="confirmation"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        onConfirm={mockOnConfirm}
        onClose={mockOnClose} 
      />
    )
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    expect(confirmButton).toHaveClass('bg-red-600', 'hover:bg-red-700')
  })

  it('uses default styling when custom confirmButtonClass is not provided', () => {
    render(
      <Modal 
        message="Confirm action?" 
        type="confirmation"
        onConfirm={mockOnConfirm}
        onClose={mockOnClose} 
      />
    )
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    expect(confirmButton).toHaveClass('bg-blue-600', 'hover:bg-blue-700')
  })

  it('has proper accessibility attributes', () => {
    render(
      <Modal 
        message="Test message" 
        type="confirmation"
        onConfirm={mockOnConfirm}
        onClose={mockOnClose} 
      />
    )
    
    // Modal should have proper focus management
    const modalContainer = screen.getByRole('dialog', { hidden: true }) || 
                          screen.getByText('Test message').closest('div[role="dialog"]') ||
                          screen.getByText('Test message').closest('.fixed')
    
    expect(modalContainer).toBeInTheDocument()
  })

  it('renders with proper z-index for overlay', () => {
    render(
      <Modal 
        message="Test message" 
        type="success" 
        onClose={mockOnClose} 
      />
    )
    
    const overlay = screen.getByText('Test message').closest('.fixed')
    expect(overlay).toHaveClass('z-50')
  })

  it('handles keyboard interactions', async () => {
    const user = userEvent.setup()
    render(
      <Modal 
        message="Test message" 
        type="confirmation"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        onClose={mockOnClose} 
      />
    )
    
    // Focus should be manageable
    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    
    await user.tab()
    expect(document.activeElement).toBe(cancelButton)
    
    await user.tab()
    expect(document.activeElement).toBe(confirmButton)
  })

  it('does not render when message is null or undefined', () => {
    const { container: nullContainer } = render(
      <Modal message={null} onClose={mockOnClose} />
    )
    const { container: undefinedContainer } = render(
      <Modal message={undefined} onClose={mockOnClose} />
    )
    
    expect(nullContainer.firstChild).toBeNull()
    expect(undefinedContainer.firstChild).toBeNull()
  })
})
