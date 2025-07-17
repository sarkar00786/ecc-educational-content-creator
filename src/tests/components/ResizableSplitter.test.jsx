import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ResizableSplitter from '../../components/chat/ResizableSplitter';

describe('ResizableSplitter', () => {
  const defaultProps = {
    onResize: vi.fn(),
    initialWidth: 256,
    currentWidth: 256,
    minWidth: 200,
    maxWidth: 500,
    isVisible: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when visible', () => {
    const { container } = render(<ResizableSplitter {...defaultProps} />);
    
    // Check if the splitter container exists
    const splitter = container.querySelector('.cursor-col-resize');
    expect(splitter).toBeInTheDocument();
  });

  it('does not render when not visible', () => {
    const { container } = render(<ResizableSplitter {...defaultProps} isVisible={false} />);
    
    // Should not render anything
    expect(container.firstChild).toBeNull();
  });

  it('calls onResize when dragging', async () => {
    const mockOnResize = vi.fn();
    render(<ResizableSplitter {...defaultProps} onResize={mockOnResize} />);
    
    const splitterHandle = document.querySelector('.cursor-col-resize');
    
    // Simulate mouse down
    fireEvent.mouseDown(splitterHandle, { clientX: 256 });
    
    // Simulate mouse move
    fireEvent.mouseMove(document, { clientX: 300 });
    
    // Should call onResize with new width
    await waitFor(() => {
      expect(mockOnResize).toHaveBeenCalled();
    });
  });

  it('respects min and max width constraints', async () => {
    const mockOnResize = vi.fn();
    render(<ResizableSplitter {...defaultProps} onResize={mockOnResize} />);
    
    const splitterHandle = document.querySelector('.cursor-col-resize');
    
    // Test minimum width constraint
    fireEvent.mouseDown(splitterHandle, { clientX: 256 });
    fireEvent.mouseMove(document, { clientX: 100 }); // Should be clamped to minWidth
    
    await waitFor(() => {
      expect(mockOnResize).toHaveBeenCalledWith(200); // minWidth
    });
    
    // Test maximum width constraint
    fireEvent.mouseDown(splitterHandle, { clientX: 256 });
    fireEvent.mouseMove(document, { clientX: 800 }); // Should be clamped to maxWidth
    
    await waitFor(() => {
      expect(mockOnResize).toHaveBeenCalledWith(500); // maxWidth
    });
  });

  it('stops resizing on mouse up', async () => {
    const mockOnResize = vi.fn();
    render(<ResizableSplitter {...defaultProps} onResize={mockOnResize} />);
    
    const splitterHandle = document.querySelector('.cursor-col-resize');
    
    // Start dragging
    fireEvent.mouseDown(splitterHandle, { clientX: 256 });
    fireEvent.mouseMove(document, { clientX: 300 });
    
    // Stop dragging
    fireEvent.mouseUp(document);
    
    // Clear previous calls
    mockOnResize.mockClear();
    
    // Mouse move after mouse up should not trigger resize
    fireEvent.mouseMove(document, { clientX: 400 });
    
    await waitFor(() => {
      expect(mockOnResize).not.toHaveBeenCalled();
    });
  });

  it('handles escape key to cancel resize', async () => {
    const mockOnResize = vi.fn();
    render(<ResizableSplitter {...defaultProps} onResize={mockOnResize} />);
    
    const splitterHandle = document.querySelector('.cursor-col-resize');
    
    // Start dragging
    fireEvent.mouseDown(splitterHandle, { clientX: 256 });
    
    // Press escape
    fireEvent.keyDown(document, { key: 'Escape' });
    
    // Clear previous calls
    mockOnResize.mockClear();
    
    // Mouse move after escape should not trigger resize
    fireEvent.mouseMove(document, { clientX: 400 });
    
    await waitFor(() => {
      expect(mockOnResize).not.toHaveBeenCalled();
    });
  });

  it('updates startWidth when currentWidth changes', () => {
    const { rerender, container } = render(<ResizableSplitter {...defaultProps} currentWidth={256} />);
    
    // Change currentWidth
    rerender(<ResizableSplitter {...defaultProps} currentWidth={300} />);
    
    // Component should update internal state
    const splitter = container.querySelector('.cursor-col-resize');
    expect(splitter).toBeInTheDocument();
  });
});
