import React, { useState, useEffect, useRef } from 'react';
import { useMessages } from '../../hooks/MessageContext';
import '../../css/AdminChat.css';

const AdminChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const { getActiveUsers, getUserMessages, markAsRead, addMessage } = useMessages();
  
  const handleUserSelect = (userId) => {
    setSelectedUser(userId);
    markAsRead(userId);
  };
  
  const handleSendReply = (userId, message) => {
    if (message.trim() === '') return;
    addMessage(userId, message, true);
  };
  
  return (
    <div className="admin-chat-page">
      <div className="admin-chat-sidebar">
        <div className="admin-chat-sidebar-header">
          <h2>Customer Conversations</h2>
        </div>
        
        <div className="chat-user-list">
          {getActiveUsers().map(user => (
            <div 
              key={user.userId} 
              className={`chat-user-item ${user.userId === selectedUser ? 'selected' : ''} ${user.unreadMessages > 0 ? 'unread' : ''}`}
              onClick={() => handleUserSelect(user.userId)}
            >
              <div className="chat-user-avatar">
                {user.userId.charAt(0).toUpperCase()}
              </div>
              <div className="chat-user-details">
                <div className="chat-user-name">
                  Customer {user.userId.substring(0, 8)}
                  {user.unreadMessages > 0 && (
                    <span className="chat-user-badge">{user.unreadMessages}</span>
                  )}
                </div>
                <div className="chat-user-last-message">
                  {user.lastMessage?.message.substring(0, 30)}
                  {user.lastMessage?.message.length > 30 && '...'}
                </div>
              </div>
              <div className="chat-user-time">
                {user.lastActivity && new Date(user.lastActivity).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          ))}
          
          {getActiveUsers().length === 0 && (
            <div className="no-chats-message">
              No active chats at the moment.
            </div>
          )}
        </div>
      </div>
      
      <div className="admin-chat-main">
        {selectedUser ? (
          <AdminChatView 
            userId={selectedUser} 
            messages={getUserMessages(selectedUser)}
            onSendReply={(message) => handleSendReply(selectedUser, message)}
          />
        ) : (
          <div className="no-chat-selected">
            <i className="fi fi-rr-comment-alt"></i>
            <h3>Select a conversation to view</h3>
            <p>Choose a customer conversation from the list to start responding.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Admin Chat View Component
const AdminChatView = ({ userId, messages, onSendReply }) => {
  const [replyMessage, setReplyMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendReply = (e) => {
    e.preventDefault();
    onSendReply(replyMessage);
    setReplyMessage('');
  };
  
  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="admin-chat-container">
      <div className="admin-chat-header">
        <div className="admin-chat-user-info">
          <div className="admin-chat-user-avatar">
            {userId.charAt(0).toUpperCase()}
          </div>
          <div className="admin-chat-user-name">
            Customer {userId.substring(0, 8)}
          </div>
        </div>
      </div>
      
      <div className="admin-chat-messages">
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`admin-chat-message ${msg.isAdminMessage ? 'admin' : 'user'}`}
          >
            <div className="message-content">{msg.message}</div>
            <div className="message-time">{formatTime(msg.timestamp)}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="admin-chat-reply-form" onSubmit={handleSendReply}>
        <input
          type="text"
          value={replyMessage}
          onChange={(e) => setReplyMessage(e.target.value)}
          placeholder="Type your reply..."
          className="admin-chat-input"
        />
        <button type="submit" className="admin-chat-send-button">
          <i className="fi fi-rr-paper-plane"></i>
        </button>
      </form>
    </div>
  );
};

export default AdminChatPage;