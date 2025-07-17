// Database Optimization Utilities for Firestore
import { writeBatch, doc, getDoc, getDocs, collection, query, where, orderBy, limit, startAfter } from 'firebase/firestore';

export class DatabaseOptimizer {
  constructor(db) {
    this.db = db;
    this.queryCache = new Map();
    this.batchOperations = [];
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.maxCacheSize = 200;
    this.appId = 'ecc-app-ab284';
  }

  // Cached document retrieval
  async getCachedDocument(path, forceRefresh = false) {
    const cacheKey = `doc:${path}`;
    const cached = this.queryCache.get(cacheKey);
    
    if (!forceRefresh && cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const docRef = doc(this.db, path);
      const docSnap = await getDoc(docRef);
      
      const result = docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
      
      this.queryCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      console.error('Error fetching cached document:', error);
      return null;
    }
  }

  // Batch write operations for better performance
  async batchWrite(operations) {
    if (operations.length === 0) return;
    
    const batch = writeBatch(this.db);
    const maxBatchSize = 500; // Firestore limit
    
    for (let i = 0; i < operations.length; i += maxBatchSize) {
      const batchOps = operations.slice(i, i + maxBatchSize);
      
      batchOps.forEach(operation => {
        const { type, ref, data } = operation;
        
        switch (type) {
          case 'set':
            batch.set(ref, data);
            break;
          case 'update':
            batch.update(ref, data);
            break;
          case 'delete':
            batch.delete(ref);
            break;
        }
      });
      
      await batch.commit();
    }
  }

  // Paginated chat history loading
  async loadChatHistory(userId, pageSize = 10, lastDoc = null) {
    const cacheKey = `chat_history:${userId}:${pageSize}:${lastDoc?.id || 'first'}`;
    const cached = this.queryCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const chatsRef = collection(this.db, `artifacts/${this.appId}/users/${userId}/chats`);
      let q = query(
        chatsRef,
        orderBy('lastUpdated', 'desc'),
        limit(pageSize)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const chats = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const result = {
        chats,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
        hasMore: querySnapshot.docs.length === pageSize
      };

      this.queryCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('Error loading chat history:', error);
      return { chats: [], hasMore: false };
    }
  }

  // Optimized message loading with compression
  async loadMessages(userId, chatId, limit = 50) {
    const cacheKey = `messages:${userId}:${chatId}:${limit}`;
    const cached = this.queryCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const chatPath = `artifacts/${this.appId}/users/${userId}/chats`;
      const chatDoc = await this.getCachedDocument(`${chatPath}/${chatId}`);
      
      if (!chatDoc) return [];

      let messages = chatDoc.messages || [];
      
      // Apply compression if messages exceed limit
      if (messages.length > limit) {
        messages = this.compressMessages(messages, limit);
      }

      // Convert Firestore timestamps to dates
      messages = messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp?.toDate ? msg.timestamp.toDate() : msg.timestamp
      }));

      this.queryCache.set(cacheKey, {
        data: messages,
        timestamp: Date.now()
      });

      return messages;
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  }

  // Compress messages intelligently
  compressMessages(messages, targetCount) {
    if (messages.length <= targetCount) return messages;
    
    // Keep first 2 messages for context
    const firstMessages = messages.slice(0, 2);
    // Keep last 60% of target for recent conversation
    const recentCount = Math.floor(targetCount * 0.6);
    const recentMessages = messages.slice(-recentCount);
    
    // Select important messages from the middle
    const middleMessages = messages.slice(2, -recentCount);
    const importantMessages = middleMessages.filter(msg => 
      msg.text.includes('?') || 
      msg.text.includes('important') || 
      msg.text.length > 200 ||
      msg.role === 'user'
    );
    
    // Take remaining slots for important messages
    const remainingSlots = targetCount - firstMessages.length - recentMessages.length;
    const selectedImportant = importantMessages.slice(-remainingSlots);
    
    return [
      ...firstMessages,
      ...selectedImportant,
      ...recentMessages
    ];
  }

  // Bulk update user preferences
  async updateUserPreferences(userId, preferences) {
    const userPath = `artifacts/${this.appId}/users/${userId}`;
    const batch = writeBatch(this.db);
    
    const userRef = doc(this.db, userPath);
    batch.update(userRef, {
      preferences,
      lastUpdated: new Date()
    });
    
    await batch.commit();
    
    // Update cache
    const cacheKey = `doc:${userPath}`;
    this.queryCache.delete(cacheKey);
  }

  // Search optimization with indexing
  async searchContent(userId, searchTerm, filters = {}) {
    const cacheKey = `search:${userId}:${searchTerm}:${JSON.stringify(filters)}`;
    const cached = this.queryCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const contentRef = collection(this.db, `artifacts/${this.appId}/users/${userId}/generatedContent`);
      let q = query(contentRef, orderBy('createdAt', 'desc'));

      // Apply filters
      if (filters.subject) {
        q = query(q, where('subject', '==', filters.subject));
      }
      
      if (filters.dateRange) {
        q = query(q, where('createdAt', '>=', filters.dateRange.start));
        q = query(q, where('createdAt', '<=', filters.dateRange.end));
      }

      const querySnapshot = await getDocs(q);
      let results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Client-side text search (can be improved with full-text search)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        results = results.filter(item => 
          item.name?.toLowerCase().includes(searchLower) ||
          item.generatedContent?.toLowerCase().includes(searchLower) ||
          item.bookContent?.toLowerCase().includes(searchLower)
        );
      }

      this.queryCache.set(cacheKey, {
        data: results,
        timestamp: Date.now()
      });

      return results;
    } catch (error) {
      console.error('Error searching content:', error);
      return [];
    }
  }

  // Analytics data collection (optimized)
  async recordAnalytics(userId, event, metadata = {}) {
    // Batch analytics events to reduce write operations
    const analyticsEvent = {
      userId,
      event,
      metadata,
      timestamp: new Date()
    };

    this.batchOperations.push({
      type: 'set',
      ref: doc(collection(this.db, `artifacts/${this.appId}/analytics`)),
      data: analyticsEvent
    });

    // Flush batch every 10 operations or after 30 seconds
    if (this.batchOperations.length >= 10) {
      await this.flushBatchOperations();
    }
  }

  // Flush pending batch operations
  async flushBatchOperations() {
    if (this.batchOperations.length === 0) return;
    
    await this.batchWrite([...this.batchOperations]);
    this.batchOperations = [];
  }

  // Cache management
  cleanupCache() {
    const now = Date.now();
    
    // Remove expired entries
    for (const [key, value] of this.queryCache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.queryCache.delete(key);
      }
    }
    
    // Limit cache size
    if (this.queryCache.size > this.maxCacheSize) {
      const entries = Array.from(this.queryCache.entries());
      const toRemove = entries.slice(0, this.queryCache.size - this.maxCacheSize);
      toRemove.forEach(([key]) => this.queryCache.delete(key));
    }
  }

  // Performance monitoring
  getPerformanceMetrics() {
    return {
      cacheSize: this.queryCache.size,
      cacheHitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0,
      pendingBatchOperations: this.batchOperations.length,
      lastCleanup: this.lastCleanup
    };
  }
}

// Auto-cleanup interval
setInterval(() => {
  if (window.dbOptimizer) {
    window.dbOptimizer.cleanupCache();
    window.dbOptimizer.flushBatchOperations();
  }
}, 30000); // Every 30 seconds
