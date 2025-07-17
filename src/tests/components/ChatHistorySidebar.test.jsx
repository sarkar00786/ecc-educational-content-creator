import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ChatHistorySidebar from '../../components/chat/ChatHistorySidebar';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
}));

// Import the mocked functions
import { onSnapshot, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

describe('ChatHistorySidebar', () => {
  const mockProps = {
    user: { uid: 'test-user' },
    db: {},
    onSelectChat: vi.fn(),
    currentChatId: null,
    onNewChat: vi.fn(),
    onDeleteChat: vi.fn(),
    onArchiveChat: vi.fn(),
    onPinChat: vi.fn(),
    onError: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful snapshot
    onSnapshot.mockImplementation((query, callback) => {
      callback({
        docs: [
          {
            id: 'general-chat',
            data: () => ({
              subject: 'General',
              title: 'General Discussion',
              isGeneral: true,
              isPinned: false,
              isArchived: false,
              messages: [],
              lastUpdated: new Date(),
            }),
          },
        ],
      });
      return vi.fn(); // unsubscribe function
    });
  });

  it('renders new chat button', () => {
    render(<ChatHistorySidebar {...mockProps} />);
    expect(screen.getByText('New Chat')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<ChatHistorySidebar {...mockProps} />);
    expect(screen.getByPlaceholderText('Search chats...')).toBeInTheDocument();
  });

  it('calls onNewChat when new chat button is clicked', () => {
    render(<ChatHistorySidebar {...mockProps} />);
    
    const newChatButton = screen.getByText('New Chat');
    fireEvent.click(newChatButton);
    
    expect(mockProps.onNewChat).toHaveBeenCalled();
  });

  it('filters chats based on search term', async () => {
    const chatsData = [
      {
        id: 'chat1',
        data: () => ({
          subject: 'Mathematics',
          title: 'Math Discussion',
          isGeneral: false,
          isPinned: false,
          isArchived: false,
          messages: [],
          lastUpdated: new Date(),
        }),
      },
      {
        id: 'chat2',
        data: () => ({
          subject: 'Science',
          title: 'Science Questions',
          isGeneral: false,
          isPinned: false,
          isArchived: false,
          messages: [],
          lastUpdated: new Date(),
        }),
      },
    ];

    onSnapshot.mockImplementation((query, callback) => {
      callback({ docs: chatsData });
      return vi.fn();
    });

    render(<ChatHistorySidebar {...mockProps} />);

    const searchInput = screen.getByPlaceholderText('Search chats...');
    fireEvent.change(searchInput, { target: { value: 'math' } });

    await waitFor(() => {
      expect(screen.getByText('Math Discussion')).toBeInTheDocument();
      expect(screen.queryByText('Science Questions')).not.toBeInTheDocument();
    });
  });

  it('shows loading spinner initially', () => {
    onSnapshot.mockImplementation(() => vi.fn());
    
    render(<ChatHistorySidebar {...mockProps} />);
    
    expect(screen.getByRole('progressbar') || screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays empty state when no chats', () => {
    onSnapshot.mockImplementation((query, callback) => {
      callback({ docs: [] });
      return vi.fn();
    });

    render(<ChatHistorySidebar {...mockProps} />);

    expect(screen.getByText('No chats yet')).toBeInTheDocument();
  });
});
