/**
 * WebSocket/SSE Notification Service - Real-time Notifications
 * 
 * This service handles real-time notification delivery via WebSockets or Server-Sent Events
 * for immediate, push-based high-priority notifications like chat messages, critical errors, etc.
 */

import { notificationService } from './notificationService';

class WebSocketNotificationService {
  constructor() {
    this.ws = null;
    this.eventSource = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.isConnected = false;
    this.preferredMethod = 'websocket'; // 'websocket' or 'sse'
    this.listeners = new Map();
    this.messageQueue = [];
    this.heartbeatInterval = null;
  }

  /**
   * Initialize real-time notification connection
   * @param {string} userId - User ID for personalized notifications
   * @param {string} method - 'websocket' or 'sse'
   */
  async initialize(userId, method = 'websocket') {
    this.userId = userId;
    this.preferredMethod = method;
    
    if (method === 'websocket') {
      return this.initializeWebSocket();
    } else {
      return this.initializeSSE();
    }
  }

  /**
   * Initialize WebSocket connection
   */
  initializeWebSocket() {
    return new Promise((resolve, reject) => {
      try {
        // Check if WebSocket is available
        if (!window.WebSocket) {
          console.warn('🔌 WebSocket not supported, falling back to polling');
          reject(new Error('WebSocket not supported'));
          return;
        }

        // Use secure WebSocket in production, regular in development
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/notifications/${this.userId}`;
        
        // Add connection timeout
        const connectionTimeout = setTimeout(() => {
          if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
            console.warn('🔌 WebSocket connection timeout');
            this.ws.close();
            reject(new Error('Connection timeout'));
          }
        }, 10000); // 10 second timeout

        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = (event) => {
          clearTimeout(connectionTimeout);
          console.log('🔌 WebSocket notification service connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.processQueuedMessages();
          resolve(event);
        };

        this.ws.onmessage = (event) => {
          this.handleIncomingMessage(event.data);
        };

        this.ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          console.log('🔌 WebSocket notification service disconnected:', event.code, event.reason);
          this.isConnected = false;
          this.stopHeartbeat();
          
          // Attempt to reconnect unless it was a deliberate close
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect();
          }
        };

        this.ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error('🔌 WebSocket notification service error:', error);
          // Don't reject immediately, let onclose handle reconnection
          if (this.reconnectAttempts === 0) {
            reject(error);
          }
        };
      } catch (error) {
        console.error('🔌 Failed to initialize WebSocket:', error);
        reject(error);
      }
    });
  }

  /**
   * Initialize Server-Sent Events connection
   */
  initializeSSE() {
    return new Promise((resolve, reject) => {
      try {
        const sseUrl = `/api/notifications/stream/${this.userId}`;
        this.eventSource = new EventSource(sseUrl);

        this.eventSource.onopen = (event) => {
          console.log('📡 SSE notification service connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.processQueuedMessages();
          resolve(event);
        };

        this.eventSource.onmessage = (event) => {
          this.handleIncomingMessage(event.data);
        };

        this.eventSource.onerror = (error) => {
          console.error('📡 SSE notification service error:', error);
          this.isConnected = false;
          
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect();
          } else {
            reject(error);
          }
        };

        // Handle specific event types
        this.eventSource.addEventListener('notification', (event) => {
          this.handleIncomingMessage(event.data);
        });

        this.eventSource.addEventListener('heartbeat', (event) => {
          console.log('💓 SSE heartbeat received');
        });

      } catch (error) {
        console.error('📡 Failed to initialize SSE:', error);
        reject(error);
      }
    });
  }

  /**
   * Handle incoming real-time notification messages
   * @param {string} data - JSON string of notification data
   */
  handleIncomingMessage(data) {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'notification':
          this.processRealTimeNotification(message.payload);
          break;
        case 'heartbeat':
          console.log('💓 Heartbeat received');
          break;
        case 'system':
          this.handleSystemMessage(message.payload);
          break;
        default:
          console.warn('🔌 Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('🔌 Error processing incoming message:', error);
    }
  }

  /**
   * Process real-time notification and integrate with notification service
   * @param {Object} notificationData - Notification data from server
   */
  processRealTimeNotification(notificationData) {
    // Mark as real-time notification
    const enhancedNotification = {
      ...notificationData,
      metadata: {
        ...notificationData.metadata,
        isRealTime: true,
        receivedAt: Date.now()
      }
    };

    // Process through existing notification service
    const notification = notificationService.processNotification(enhancedNotification);
    
    // Emit to listeners
    this.emitToListeners('notification', notification);
    
    console.log('🔔 Real-time notification processed:', notification);
  }

  /**
   * Handle system messages (connection status, errors, etc.)
   * @param {Object} systemData - System message data
   */
  handleSystemMessage(systemData) {
    switch (systemData.action) {
      case 'reconnect':
        this.disconnect();
        setTimeout(() => this.initialize(this.userId, this.preferredMethod), 1000);
        break;
      case 'maintenance':
        this.emitToListeners('system', {
          type: 'maintenance',
          message: systemData.message || 'System maintenance in progress'
        });
        break;
      default:
        console.log('🔧 System message:', systemData);
    }
  }

  /**
   * Send notification to server for real-time distribution
   * @param {Object} notificationData - Notification to send
   */
  sendNotification(notificationData) {
    const message = {
      type: 'notification',
      payload: notificationData,
      timestamp: Date.now()
    };

    if (this.isConnected) {
      this.send(JSON.stringify(message));
    } else {
      // Queue message for later delivery
      this.messageQueue.push(message);
      console.log('📤 Notification queued for delivery:', notificationData);
    }
  }

  /**
   * Send raw message through active connection
   * @param {string} message - Message to send
   */
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      console.warn('🔌 WebSocket not connected, cannot send message');
    }
  }

  /**
   * Attempt to reconnect to the service
   */
  attemptReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    
    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    
    setTimeout(() => {
      this.initialize(this.userId, this.preferredMethod)
        .catch(error => {
          console.error('🔄 Reconnection failed:', error);
        });
    }, delay);
  }

  /**
   * Process queued messages after reconnection
   */
  processQueuedMessages() {
    if (this.messageQueue.length > 0) {
      console.log(`📤 Processing ${this.messageQueue.length} queued messages`);
      
      this.messageQueue.forEach(message => {
        this.send(JSON.stringify(message));
      });
      
      this.messageQueue = [];
    }
  }

  /**
   * Start heartbeat to keep connection alive
   */
  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
      }
    }, 30000); // 30 seconds
  }

  /**
   * Stop heartbeat interval
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Add event listener
   * @param {string} event - Event type
   * @param {Function} callback - Callback function
   */
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event type
   * @param {Function} callback - Callback function
   */
  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to all listeners
   * @param {string} event - Event type
   * @param {*} data - Event data
   */
  emitToListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`🔌 Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Disconnect from notification service
   */
  disconnect() {
    this.isConnected = false;
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Deliberate disconnect');
      this.ws = null;
    }
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    console.log('🔌 Notification service disconnected');
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      method: this.preferredMethod,
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length
    };
  }
}

// Export singleton instance
export const webSocketNotificationService = new WebSocketNotificationService();
