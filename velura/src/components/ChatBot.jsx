import React, { useState, useEffect, useRef } from 'react';
import { useMessages } from '../hooks/MessageContext';
import '../css/ChatSystem.css';

const ChatSystem = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [localMessages, setLocalMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState('faq');
  const [adminOnline, setAdminOnline] = useState(false);
  const [userId, setUserId] = useState('');
  const messagesEndRef = useRef(null);
  
  // Get message context functions
  const { addMessage, getUserMessages } = useMessages();

  const faqQuestions = [
    { id: 1, question: "How do I check my order status?" },
    { id: 2, question: "What payment methods do you accept?" },
    { id: 3, question: "How to return a saree?" },
    { id: 4, question: "Do you ship internationally?" },
    { id: 5, question: "How to measure for a perfect fit?" }
  ];

  const faqAnswers = {
    1: "You can check your order status by logging into your account and visiting the 'My Orders' section.",
    2: "We accept credit cards, debit cards, UPI, net banking, and cash on delivery for orders within India.",
    3: "You can return a saree within 7 days of delivery. Please visit the 'Returns' section in your account for detailed instructions.",
    4: "Yes, we ship internationally to over 50 countries. Shipping costs and delivery times vary by location.",
    5: "Please visit our 'Size Guide' section for detailed measurement instructions for different saree styles."
  };
  
  // Generate a unique ID for the current user session
  useEffect(() => {
    const storedUserId = localStorage.getItem('chatUserId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = `user_${Date.now()}`;
      localStorage.setItem('chatUserId', newUserId);
      setUserId(newUserId);
    }
  }, []);
  
  // Load previous messages for this user
  useEffect(() => {
    if (userId) {
      const loadUserMessages = () => {
        const userMessages = getUserMessages(userId);
        if (userMessages.length > 0) {
          setLocalMessages(userMessages.map(msg => ({
            id: msg.id,
            text: msg.message,
            sender: msg.isAdminMessage ? 'system' : 'user'
          })));
        } else if (isOpen && localMessages.length === 0) {
          // Add welcome message if no messages and chat is open
          setLocalMessages([
            { 
              id: Date.now(), 
              text: "Welcome to our Saree Shop! How can we help you today?", 
              sender: 'system' 
            }
          ]);
        }
      };
      
      loadUserMessages();
      
      // Set interval to periodically check for new messages
      const interval = setInterval(loadUserMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [userId, isOpen, getUserMessages]);

  // Simulating admin status check
  useEffect(() => {
    const checkAdminStatus = () => {
      // For a real implementation, you would check with your backend
      const isOnline = Math.random() > 0.5;
      setAdminOnline(isOnline);
    };
    
    checkAdminStatus();
    const interval = setInterval(checkAdminStatus, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && userId) {
      // If opening chat and we have a userId, check for messages
      const userMessages = getUserMessages(userId);
      if (userMessages.length > 0) {
        // Convert to local message format
        setLocalMessages(userMessages.map(msg => ({
          id: msg.id,
          text: msg.message,
          sender: msg.isAdminMessage ? 'system' : 'user'
        })));
      } else {
        // Add welcome message when chat is opened and no messages exist
        setLocalMessages([
          { 
            id: Date.now(), 
            text: "Welcome to our Saree Shop! How can we help you today?", 
            sender: 'system' 
          }
        ]);
      }
    }
  };

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    
    // Add system message based on selected option
    const newMessage = { 
      id: Date.now(), 
      text: option === 'faq' 
        ? "Please select a question from below:" 
        : adminOnline 
          ? "You're now chatting with admin. Please ask your question." 
          : "Admin is currently offline. Your message will be answered when they return.",
      sender: 'system' 
    };
    
    setLocalMessages(prev => [...prev, newMessage]);
    
    // If switching to admin chat, store this system message
    if (option === 'admin' && userId) {
      // Don't store FAQ introductory messages in the shared context
      addMessage(userId, newMessage.text, true);
    }
  };

  const selectFaqQuestion = (id) => {
    const question = faqQuestions.find(q => q.id === id).question;
    const answer = faqAnswers[id];
    
    setLocalMessages(prev => [
      ...prev,
      { id: Date.now(), text: question, sender: 'user' },
      { id: Date.now() + 1, text: answer, sender: 'system' }
    ]);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const timestamp = Date.now();
    
    // Add user message to local state
    setLocalMessages(prev => [
      ...prev,
      { id: timestamp, text: inputValue, sender: 'user' }
    ]);

    // If in admin chat mode
    if (selectedOption === 'admin' && userId) {
      // Add message to context (will notify admin)
      addMessage(userId, inputValue, false);
      
      // Add a system message acknowledging receipt
      const acknowledgementMsg = { 
        id: timestamp + 1, 
        text: adminOnline 
          ? "Your message has been sent to our admin. They'll respond shortly." 
          : "Your message has been received and will be answered when admin comes online.", 
        sender: 'system' 
      };
      
      setLocalMessages(prev => [...prev, acknowledgementMsg]);
      
      // Also store the acknowledgement message
      addMessage(userId, acknowledgementMsg.text, true);
    }

    setInputValue('');
  };

  return (
    <div className="chat-container">
      {/* Chat toggle button */}
      <button 
        className="chat-button"
        onClick={toggleChat}
      >
        {isOpen ? 'Close Chat' : 'Chat with Us'}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Customer Support</h3>
            <div className="chat-options">
              <button 
                className={selectedOption === 'faq' ? 'active' : ''}
                onClick={() => handleOptionChange('faq')}
              >
                FAQs
              </button>
              <button 
                className={selectedOption === 'admin' ? 'active' : ''}
                onClick={() => handleOptionChange('admin')}
              >
                Chat with Admin {adminOnline ? '(Online)' : '(Offline)'}
              </button>
            </div>
          </div>

          <div className="chat-messages">
            {localMessages.map(msg => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            
            {/* FAQ questions display */}
            {selectedOption === 'faq' && localMessages.length > 0 && (
              <div className="faq-questions">
                {faqQuestions.map(q => (
                  <button 
                    key={q.id} 
                    onClick={() => selectFaqQuestion(q.id)}
                    className="faq-question-button"
                  >
                    {q.question}
                  </button>
                ))}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          {selectedOption === 'admin' && (
            <form onSubmit={sendMessage} className="chat-input-form">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="chat-input"
              />
              <button type="submit" className="send-button">Send</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatSystem;