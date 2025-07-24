import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react';
// fireEvent imported but not used - commented out
import userEvent from '@testing-library/user-event'
import Header from '../../components/layout/Header'

// Mock the SettingsProvider
const mockUpdatePreferences = vi.fn()
const mockSettingsContext = {
  theme: 'light',
  setTheme: vi.fn(),
  preferences: { theme: 'light' },
  updatePreferences: mockUpdatePreferences,
}

vi.mock('../../contexts/SettingsContext', () => ({
  useSettings: () => mockSettingsContext,
}))

describe('Header Component', () => {
  const mockProps = {
    currentPage: 'generation',
    setCurrentPage: vi.fn(),
    theme: 'light',
    setTheme: vi.fn(),
    user: {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: null
    },
    onLogout: vi.fn(),
    onNavigateToSettings: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    const { container } = render(<Header {...mockProps} />)
    expect(container).toBeInTheDocument()
  })

  it('displays the app title', () => {
    render(<Header {...mockProps} />)
    expect(screen.getByText('ECC')).toBeInTheDocument()
  })

  it('shows navigation tabs for authenticated user', () => {
    render(<Header {...mockProps} />)
    
    // The header shows a toggle button - when on generation page, it shows "Content History" as the toggle option
    expect(screen.getByText('Content History')).toBeInTheDocument()
    // Magic Discussion button has been removed as part of chat feature removal
  })

  it('highlights the current active page', () => {
    render(<Header {...mockProps} currentPage="history" />)
    
    // When on history page, the button shows "Content Generation" as the toggle option
    const generationTab = screen.getByText('Content Generation')
    expect(generationTab.closest('button')).toHaveClass('bg-gradient-to-r from-green-600 to-blue-600')
  })

  it('calls setCurrentPage when navigation tab is clicked', async () => {
    const user = userEvent.setup()
    render(<Header {...mockProps} />)
    
    const historyTab = screen.getByText('Content History')
    await user.click(historyTab)
    
    expect(mockProps.setCurrentPage).toHaveBeenCalledWith('history')
  })

  it('displays user profile dropdown when avatar is clicked', async () => {
    const user = userEvent.setup()
    render(<Header {...mockProps} />)
    
    const avatarButton = screen.getByRole('button', { name: /user menu/i })
    await user.click(avatarButton)
    
    expect(screen.getByText('My Profile')).toBeInTheDocument()
    expect(screen.getByText('Sign Out')).toBeInTheDocument()
  })

  it('calls onLogout when logout is clicked', async () => {
    const user = userEvent.setup()
    render(<Header {...mockProps} />)
    
    const avatarButton = screen.getByRole('button', { name: /user menu/i })
    await user.click(avatarButton)
    
    const logoutButton = screen.getByText('Sign Out')
    await user.click(logoutButton)
    
    expect(mockProps.onLogout).toHaveBeenCalled()
  })

  it('toggles theme when theme button is clicked', async () => {
    const user = userEvent.setup()
    render(<Header {...mockProps} />)
    
    const themeButton = screen.getByRole('switch', { name: /switch to dark mode/i })
    await user.click(themeButton)
    
    expect(mockProps.setTheme).toHaveBeenCalled()
  })

  it('shows user email and name in profile dropdown', async () => {
    const user = userEvent.setup()
    render(<Header {...mockProps} />)
    
    const avatarButton = screen.getByRole('button', { name: /user menu/i })
    await user.click(avatarButton)
    
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('handles user without display name', async () => {
    const userWithoutName = { ...mockProps.user, displayName: null }
    const propsWithoutName = { ...mockProps, user: userWithoutName }
    
    const user = userEvent.setup()
    render(<Header {...propsWithoutName} />)
    
    const avatarButton = screen.getByRole('button', { name: /user menu/i })
    await user.click(avatarButton)
    
    expect(screen.getByText('User')).toBeInTheDocument()
  })

  it('is responsive and shows mobile menu button on small screens', () => {
    // Mock window.innerWidth for mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 640,
    })
    
    render(<Header {...mockProps} />)
    
    const mobileMenuButton = screen.getByRole('button', { name: /menu/i })
    expect(mobileMenuButton).toBeInTheDocument()
  })

  it('has proper ARIA labels for accessibility', () => {
    render(<Header {...mockProps} />)
    
    const navigation = screen.getByRole('navigation')
    expect(navigation).toBeInTheDocument()
    
    const userMenuButton = screen.getByRole('button', { name: /user menu/i })
    expect(userMenuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('navigates to settings when settings menu item is clicked', async () => {
    const user = userEvent.setup()
    render(<Header {...mockProps} />)
    
    const avatarButton = screen.getByLabelText('User menu')
    await user.click(avatarButton)
    
    // Wait for dropdown menu to appear
    await waitFor(() => {
      expect(screen.getByText('Advanced Settings')).toBeInTheDocument()
    })
    
    const settingsButton = screen.getByText('Advanced Settings')
    await user.click(settingsButton)
    
    expect(mockProps.onNavigateToSettings).toHaveBeenCalled()
  })
})
