import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ChatCard from '../../components/chat/ChatCard';

describe('ChatCard', () => {
  const mockChat = {
    id: 'test-chat',
    title: 'Test Chat',
    subject: 'Mathematics',
    messages: [
      { role: 'user', text: 'Hello' },
      { role: 'model', text: 'Hi there! How can I help you with mathematics today?' }
    ],
    lastUpdated: new Date(),
    isPinned: false,
    isArchived: false,
  };

  const mockProps = {
    chat: mockChat,
    isSelected: false,
    onSelect: vi.fn(),
    onDelete: vi.fn(),
    onArchive: vi.fn(),
    onPin: vi.fn(),
    onUpdateTitle: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders chat title', () => {
    render(<ChatCard {...mockProps} />);
    expect(screen.getByText('Test Chat')).toBeInTheDocument();
  });

  it('renders subject tag', () => {
    render(<ChatCard {...mockProps} />);
    expect(screen.getByText('Mathematics')).toBeInTheDocument();
  });

  it('renders preview text from first AI message', () => {
    render(<ChatCard {...mockProps} />);
    // The preview text should be truncated to 50 characters
    expect(screen.getByText(/Hi there! How can I help you with mathematics/)).toBeInTheDocument();
  });

  it('calls onSelect when card is clicked', () => {
    render(<ChatCard {...mockProps} />);
    
    const card = screen.getByText('Test Chat').closest('div');
    fireEvent.click(card);
    
    expect(mockProps.onSelect).toHaveBeenCalledWith('test-chat');
  });

  it('shows pin icon when chat is pinned', () => {
    const pinnedChat = { ...mockChat, isPinned: true };
    render(<ChatCard {...mockProps} chat={pinnedChat} />);
    
    expect(screen.getByTestId('pin-icon') || screen.getByTitle(/pin/i)).toBeInTheDocument();
  });

  it('applies selected styles when isSelected is true', () => {
    const { container } = render(<ChatCard {...mockProps} isSelected={true} />);
    
    const card = container.firstChild;
    expect(card).toHaveClass('bg-blue-100');
  });

  it('shows special styling for general chat', () => {
    const generalChat = { ...mockChat, isGeneral: true };
    const { container } = render(<ChatCard {...mockProps} chat={generalChat} isGeneral={true} />);
    
    const card = container.firstChild;
    expect(card).toHaveClass('border-green-200');
  });

  it('shows action menu on hover for non-general chats', () => {
    render(<ChatCard {...mockProps} />);
    
    const menuButton = screen.getByRole('button', { name: /more/i });
    fireEvent.click(menuButton);
    
    expect(screen.getByText('Pin')).toBeInTheDocument();
    expect(screen.getByText('Archive')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('does not show action menu for general chat', () => {
    const generalChat = { ...mockChat, isGeneral: true };
    render(<ChatCard {...mockProps} chat={generalChat} isGeneral={true} />);
    
    expect(screen.queryByRole('button', { name: /more/i })).not.toBeInTheDocument();
  });

  it('calls onPin when pin action is clicked', () => {
    render(<ChatCard {...mockProps} />);
    
    const menuButton = screen.getByRole('button', { name: /more/i });
    fireEvent.click(menuButton);
    
    const pinButton = screen.getByText('Pin');
    fireEvent.click(pinButton);
    
    expect(mockProps.onPin).toHaveBeenCalledWith('test-chat');
  });

  it('calls onArchive when archive action is clicked', () => {
    render(<ChatCard {...mockProps} />);
    
    const menuButton = screen.getByRole('button', { name: /more/i });
    fireEvent.click(menuButton);
    
    const archiveButton = screen.getByText('Archive');
    fireEvent.click(archiveButton);
    
    expect(mockProps.onArchive).toHaveBeenCalledWith('test-chat');
  });

  it('calls onDelete when delete action is clicked', () => {
    render(<ChatCard {...mockProps} />);
    
    const menuButton = screen.getByRole('button', { name: /more/i });
    fireEvent.click(menuButton);
    
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    
    expect(mockProps.onDelete).toHaveBeenCalledWith('test-chat');
  });

  it('shows "No messages yet" when chat has no messages', () => {
    const emptyChat = { ...mockChat, messages: [] };
    render(<ChatCard {...mockProps} chat={emptyChat} />);
    
    expect(screen.getByText('No messages yet')).toBeInTheDocument();
  });

  it('shows edit title button on hover for non-general chats', () => {
    const { container } = render(<ChatCard {...mockProps} />);
    
    const editButton = screen.getByTitle('Edit title');
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass('opacity-0');
  });

  it('does not show edit title button for general chats', () => {
    const generalChat = { ...mockChat, isGeneral: true };
    render(<ChatCard {...mockProps} chat={generalChat} isGeneral={true} />);
    
    expect(screen.queryByTitle('Edit title')).not.toBeInTheDocument();
  });

  it('shows edit title option in dropdown menu', () => {
    render(<ChatCard {...mockProps} />);
    
    const menuButton = screen.getByRole('button', { name: /more/i });
    fireEvent.click(menuButton);
    
    expect(screen.getByText('Edit Title')).toBeInTheDocument();
  });

  it('enters edit mode when edit title button is clicked', () => {
    render(<ChatCard {...mockProps} />);
    
    const editButton = screen.getByTitle('Edit title');
    fireEvent.click(editButton);
    
    expect(screen.getByDisplayValue('Test Chat')).toBeInTheDocument();
    expect(screen.getByTitle('Save title')).toBeInTheDocument();
    expect(screen.getByTitle('Cancel editing')).toBeInTheDocument();
  });

  it('calls onUpdateTitle when title is saved', () => {
    render(<ChatCard {...mockProps} />);
    
    const editButton = screen.getByTitle('Edit title');
    fireEvent.click(editButton);
    
    const input = screen.getByDisplayValue('Test Chat');
    fireEvent.change(input, { target: { value: 'Updated Title' } });
    
    const saveButton = screen.getByTitle('Save title');
    fireEvent.click(saveButton);
    
    expect(mockProps.onUpdateTitle).toHaveBeenCalledWith('test-chat', 'Updated Title');
  });

  it('cancels edit mode when cancel button is clicked', () => {
    render(<ChatCard {...mockProps} />);
    
    const editButton = screen.getByTitle('Edit title');
    fireEvent.click(editButton);
    
    const input = screen.getByDisplayValue('Test Chat');
    fireEvent.change(input, { target: { value: 'Changed Title' } });
    
    const cancelButton = screen.getByTitle('Cancel editing');
    fireEvent.click(cancelButton);
    
    expect(screen.getByText('Test Chat')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Changed Title')).not.toBeInTheDocument();
  });

  it('prevents card selection when in edit mode', () => {
    render(<ChatCard {...mockProps} />);
    
    const editButton = screen.getByTitle('Edit title');
    fireEvent.click(editButton);
    
    // In edit mode, the title text is replaced with an input field
    const card = screen.getByDisplayValue('Test Chat').closest('div');
    fireEvent.click(card);
    
    expect(mockProps.onSelect).not.toHaveBeenCalled();
  });
});
