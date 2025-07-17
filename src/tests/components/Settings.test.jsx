import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import PreferencesPage from '../../components/settings/PreferencesPage'
import { SettingsProvider } from '../../contexts/SettingsContext'

// Mock Firebase and other modules
vi.mock('../../services/firebase', () => ({
  auth: {},
  db: {},
  getAppId: () => 'test-app-id'
}))

vi.mock('../../utils/settings', () => ({
  preferencesManager: {
    load: () => ({
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        push: false,
        contentGeneration: true,
        updates: true
      },
      accessibility: {
        fontSize: 'medium',
        highContrast: false,
        reduceMotion: false
      }
    }),
    save: vi.fn(),
    reset: vi.fn()
  }
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false })),
  collection: vi.fn()
}))

describe('PreferencesPage Component', () => {
  it('renders without crashing', () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User'
    }
    
    const { container } = render(
      <SettingsProvider>
        <PreferencesPage user={mockUser} onBack={() => {}} />
      </SettingsProvider>
    )
    expect(container).toBeInTheDocument()
  })

  it('renders with null user', () => {
    const { container } = render(
      <SettingsProvider>
        <PreferencesPage user={null} onBack={() => {}} />
      </SettingsProvider>
    )
    expect(container).toBeInTheDocument()
  })
})
