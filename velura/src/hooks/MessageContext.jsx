import React, { createContext, useState, useEffect, useContext } from 'react';

// Create context
const MessageContext = createContext();

// Create a provider component
export const MessageProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Load messages from localStorage on component mount
  useEffect(() => {
    const loadMessages = () => {
      const storedMessages = localStorage.getItem('chatMessages');
      if (storedMessages) {
        try {
          const parsedMessages = JSON.parse(storedMessages);
          setMessages(parsedMessages);
          
          // Calculate unread messages for admin
          const unreadMessages = parsedMessages.filter(
            msg => msg.isAdminMessage === false && msg.read === false
          ).length;
          
          setUnreadCount(unreadMessages);
        } catch (error) {
          console.error("Error parsing stored messages:", error);
          localStorage.removeItem('chatMessages');
          setMessages([]);
          setUnreadCount(0);
        }
      }
    };
    
    // Load immediately on mount
    loadMessages();
    
    // Also set up a window event listener to keep messages in sync across tabs/windows
    window.addEventListener('storage', (event) => {
      if (event.key === 'chatMessages') {
        loadMessages();
      }
    });
    
    // Set up interval to periodically check for new messages
    const interval = setInterval(loadMessages, 3000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', loadMessages);
    };
  }, []);
  
  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);
  
  // Add a new message
  const addMessage = (userId, message, isAdminMessage = false) => {
    const newMessage = {
      id: Date.now(),
      userId,
      message,
      timestamp: new Date().toISOString(),
      read: isAdminMessage, // Admin messages are considered read
      isAdminMessage,
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    // Update unread count for admin
    if (!isAdminMessage) {
      setUnreadCount(prevCount => prevCount + 1);
    }
    
    return newMessage;
  };
  
  // Mark messages as read
  const markAsRead = (userId) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.userId === userId && !msg.isAdminMessage 
          ? { ...msg, read: true } 
          : msg
      )
    );
    
    // Recalculate unread count
    const updatedMessages = messages.map(msg => 
      msg.userId === userId && !msg.isAdminMessage 
        ? { ...msg, read: true } 
        : msg
    );
    
    const unreadMessages = updatedMessages.filter(
      msg => msg.isAdminMessage === false && msg.read === false
    ).length;
    
    setUnreadCount(unreadMessages);
  };
  
  // Get messages for a specific user
  const getUserMessages = (userId) => {
    // Force reload from localStorage first to ensure latest data
    const storedMessages = localStorage.getItem('chatMessages');
    if (storedMessages) {
      try {
        const parsedMessages = JSON.parse(storedMessages);
        return parsedMessages.filter(msg => msg.userId === userId);
      } catch (error) {
        console.error("Error getting user messages:", error);
        return [];
      }
    }
    return messages.filter(msg => msg.userId === userId);
  };
  
  // Get all unique users who have sent messages
  const getActiveUsers = () => {
    // Force reload from localStorage first to ensure latest data
    const storedMessages = localStorage.getItem('chatMessages');
    let messageData = messages;
    
    if (storedMessages) {
      try {
        messageData = JSON.parse(storedMessages);
      } catch (error) {
        console.error("Error getting active users:", error);
      }
    }
    
    const userIds = [...new Set(messageData.map(msg => msg.userId))];
    
    return userIds.map(userId => {
      const userMessages = messageData.filter(msg => msg.userId === userId);
      const lastMessage = userMessages[userMessages.length - 1];
      const unreadMessages = userMessages.filter(
        msg => msg.isAdminMessage === false && msg.read === false
      ).length;
      
      return {
        userId,
        lastMessage,
        unreadMessages,
        lastActivity: lastMessage ? lastMessage.timestamp : null
      };
    }).sort((a, b) => {
      // Sort by last activity time (most recent first)
      if (!a.lastActivity) return 1;
      if (!b.lastActivity) return -1;
      return new Date(b.lastActivity) - new Date(a.lastActivity);
    });
  };

  // Remove all messages for testing purposes
  const clearAllMessages = () => {
    localStorage.removeItem('chatMessages');
    setMessages([]);
    setUnreadCount(0);
  };
  
  return (
    <MessageContext.Provider 
      value={{ 
        messages, 
        addMessage, 
        markAsRead, 
        getUserMessages, 
        getActiveUsers,
        unreadCount,
        clearAllMessages
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

// Custom hook to use the message context
export const useMessages = () => useContext(MessageContext);

export default MessageContext;