import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthScreen from '../../components/auth/AuthScreen'

// Mock Firebase services
vi.mock('../../services/firebase', () => ({
  signInWithGoogle: vi.fn()
}))

import { signInWithGoogle } from '../../services/firebase'

describe('AuthScreen Component', () => {
  const mockOnAuthSuccess = vi.fn()
  const mockOnError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    const { container } = render(
      <AuthScreen 
        onAuthSuccess={mockOnAuthSuccess} 
        onError={mockOnError} 
      />
    )
    expect(container).toBeInTheDocument()
  })

  it('displays social sign-in buttons by default', () => {
    render(
      <AuthScreen 
        onAuthSuccess={mockOnAuthSuccess} 
        onError={mockOnError} 
      />
    )
    
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in with email/i })).toBeInTheDocument()
    expect(screen.getByText(/choose your preferred sign-in method/i)).toBeInTheDocument()
  })

  it('switches to email auth mode when email button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <AuthScreen 
        onAuthSuccess={mockOnAuthSuccess} 
        onError={mockOnError} 
      />
    )
    
    const emailButton = screen.getByRole('button', { name: /sign in with email/i })
    await user.click(emailButton)
    
    // After clicking email button, it should switch to email auth form
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    })
  })

it('shows loading state during google authentication', async () => {
    // Set up mock to delay authentication
    signInWithGoogle.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ user: {} }), 1000)))
    
    const user = userEvent.setup()
    render(
      <AuthScreen 
        onAuthSuccess={mockOnAuthSuccess} 
        onError={mockOnError} 
      />
    )
    
    const googleButton = screen.getByRole('button', { name: /sign in with google/i })
    
    // Click the button
    await user.click(googleButton)
    
    // Check that button is disabled during loading
    expect(googleButton).toBeDisabled()
    
    // Wait for authentication to complete
    await waitFor(() => {
      expect(mockOnAuthSuccess).toHaveBeenCalled()
    })
  })

  it('has proper accessibility attributes for social buttons', () => {
    render(
      <AuthScreen 
        onAuthSuccess={mockOnAuthSuccess} 
        onError={mockOnError} 
      />
    )
    
    const googleButton = screen.getByRole('button', { name: /sign in with google/i })
    const emailButton = screen.getByRole('button', { name: /sign in with email/i })
    
    expect(googleButton).toHaveAttribute('aria-label', 'Sign in with Google')
    expect(emailButton).toHaveAttribute('aria-label', 'Sign in with Email')
  })
})
