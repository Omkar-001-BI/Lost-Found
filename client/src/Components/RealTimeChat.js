import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

import { baseURL } from '../api/axios';

const SOCKET_URL = baseURL;

const RealTimeChat = ({ currentUser, otherUser, itemId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const setupSocket = () => {
      if (!socketRef.current) {
        socketRef.current = io(SOCKET_URL);
      }

      const handleReceiveMessage = (msg) => {
        const isRelevantMessage = 
          (msg.senderId._id === otherUser._id && msg.receiverId._id === currentUser._id) ||
          (msg.senderId._id === currentUser._id && msg.receiverId._id === otherUser._id);

        if (isRelevantMessage && (!itemId || msg.itemId === itemId)) {
          setMessages(prev => {
            const messageExists = prev.some(m => m._id === msg._id);
            if (messageExists) return prev;
            const newMessages = [...prev, msg];
            return newMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          });
        }
      };

      const handleMessageHistory = (history) => {
        if (Array.isArray(history)) {
          const sortedHistory = history.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          setMessages(sortedHistory);
        }
      };

      const handleMessageSent = (msg) => {
        const isRelevantMessage = 
          msg.senderId._id === currentUser._id && 
          msg.receiverId._id === otherUser._id && 
          (!itemId || msg.itemId === itemId);

        if (isRelevantMessage) {
          setMessages(prev => {
            const messageExists = prev.some(m => m._id === msg._id);
            if (messageExists) return prev;
            const newMessages = [...prev, msg];
            return newMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          });
        }
      };

      const handleMessageError = (error) => {
        console.error('Message error:', error);
        // You could add UI feedback here
      };

      // Clean up previous listeners
      socketRef.current.off('receive_message');
      socketRef.current.off('message_history');
      socketRef.current.off('message_sent');
      socketRef.current.off('message_error');

      // Set up new listeners
      socketRef.current.on('receive_message', handleReceiveMessage);
      socketRef.current.on('message_history', handleMessageHistory);
      socketRef.current.on('message_sent', handleMessageSent);
      socketRef.current.on('message_error', handleMessageError);

      // Join room and request message history
      socketRef.current.emit('join', currentUser._id);
      socketRef.current.emit('get_message_history', {
        userId: currentUser._id,
        otherUserId: otherUser._id,
        itemId: itemId || 'no-item'
      });
    };

    setupSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.off('receive_message');
        socketRef.current.off('message_history');
        socketRef.current.off('message_sent');
        socketRef.current.off('message_error');
      }
    };
  }, [currentUser._id, otherUser._id, itemId]);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || !socketRef.current) return;

    const messageData = {
      senderId: currentUser._id,
      receiverId: otherUser._id,
      text: trimmedMessage,
      itemId: itemId || 'no-item'
    };

    socketRef.current.emit('send_message', messageData);
    setNewMessage('');
  };

  const isOwnMessage = (msg) => {
    return msg.senderId._id === currentUser._id;
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '500px', 
      maxWidth: '400px', 
      border: '1px solid #e3f2fd', 
      borderRadius: '16px',
      backgroundColor: '#f7f9fb',
      boxShadow: '0 8px 32px rgba(25, 118, 210, 0.1)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        color: 'white',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(66, 165, 245, 0.3)'
        }}>
          {(otherUser.nickname || otherUser.fullname || 'U').charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '2px' }}>
            {otherUser.nickname || otherUser.fullname || 'User'}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>
            {itemId ? 'Item Chat' : 'Direct Message'}
          </div>
        </div>
      </div>
      {/* Messages Area */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        background: 'linear-gradient(135deg, #f7f9fb 0%, #e3f2fd 100%)',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%231976d2\" fill-opacity=\"0.03\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
      }}>
        {messages.map((msg, idx) => (
          <div key={msg._id || idx} style={{
            display: 'flex',
            justifyContent: isOwnMessage(msg) ? 'flex-end' : 'flex-start',
            marginBottom: '12px'
          }}>
            <div style={{
              maxWidth: '75%',
              padding: '12px 16px',
              borderRadius: '20px',
              background: isOwnMessage(msg) 
                ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)' 
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              color: isOwnMessage(msg) ? 'white' : '#222',
              boxShadow: isOwnMessage(msg) 
                ? '0 4px 12px rgba(25, 118, 210, 0.3)' 
                : '0 2px 8px rgba(0, 0, 0, 0.08)',
              position: 'relative',
              wordWrap: 'break-word',
              border: isOwnMessage(msg) ? 'none' : '1px solid rgba(25, 118, 210, 0.1)'
            }}>
              <div style={{ fontSize: '14px', lineHeight: '1.5', fontWeight: 400 }}>
                {msg.text}
              </div>
              <div style={{
                fontSize: '11px',
                color: isOwnMessage(msg) ? 'rgba(255, 255, 255, 0.8)' : '#666',
                textAlign: isOwnMessage(msg) ? 'right' : 'left',
                marginTop: '6px',
                fontWeight: 500
              }}>
                {new Date(msg.createdAt).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {/* Input Area */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e3f2fd',
        boxShadow: '0 -2px 8px rgba(25, 118, 210, 0.05)'
      }}>
        <form onSubmit={handleSend} style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: '14px 18px',
              borderRadius: '25px',
              border: '2px solid #e3f2fd',
              outline: 'none',
              fontSize: '14px',
              backgroundColor: '#f8f9fa',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(25, 118, 210, 0.05)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#1976d2';
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.boxShadow = '0 4px 12px rgba(25, 118, 210, 0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e3f2fd';
              e.target.style.backgroundColor = '#f8f9fa';
              e.target.style.boxShadow = '0 2px 4px rgba(25, 118, 210, 0.05)';
            }}
          />
          <button 
            type="submit" 
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 6px 16px rgba(25, 118, 210, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 12px rgba(25, 118, 210, 0.3)';
            }}
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
};

export default RealTimeChat;