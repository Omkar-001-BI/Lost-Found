import React, { useEffect, useState, useRef } from 'react';
import api, { baseURL } from '../api/axios';
import { Stack, Typography, Avatar, Button, CircularProgress, Paper, Box, Divider, Alert, Modal } from '@mui/material';
import RealTimeChat from './RealTimeChat';
import { io } from 'socket.io-client';

const SOCKET_URL = baseURL;

const MyMessages = () => {
  const user = JSON.parse(window.localStorage.getItem('user'));
  const token = window.localStorage.getItem('token');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const socketRef = useRef(null);

  const setupSocketListeners = () => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL);
    }

    socketRef.current.on('conversations_list', (conversationList) => {
      setConversations(conversationList);
      setLoading(false);
    });

    socketRef.current.on('error', (errorData) => {
      setError(errorData.msg || 'An error occurred');
      setLoading(false);
    });

    socketRef.current.on('receive_message', (msg) => {
      setConversations(prevConversations => {
        const otherUserId = msg.senderId === user._id ? msg.receiverId : msg.senderId;
        const existingConversation = prevConversations.find(conv => 
          conv._id.toString() === otherUserId.toString()
        );

        if (existingConversation) {
          return prevConversations.map(conv => 
            conv._id.toString() === otherUserId.toString()
              ? { ...conv, lastMessage: msg }
              : conv
          ).sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
        }
        return prevConversations;
      });
    });

    socketRef.current.on('message_sent', (msg) => {
      setConversations(prevConversations => {
        const otherUserId = msg.receiverId;
        const existingConversation = prevConversations.find(conv => 
          conv._id.toString() === otherUserId.toString()
        );

        if (existingConversation) {
          return prevConversations.map(conv => 
            conv._id.toString() === otherUserId.toString()
              ? { ...conv, lastMessage: msg }
              : conv
          ).sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
        }
        return prevConversations;
      });
    });

    socketRef.current.on('conversation_updated', () => {
      socketRef.current.emit('get_conversations', user._id);
    });
  };

  const fetchConversations = () => {
    if (!user || !user._id || !token) {
      setError('Please log in to view your messages.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      setupSocketListeners();
      socketRef.current.emit('join', user._id);
      socketRef.current.emit('get_conversations', user._id);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id && token) {
      fetchConversations();
      return () => {
        if (socketRef.current) {
          socketRef.current.off('conversations_list');
          socketRef.current.off('error');
          socketRef.current.off('receive_message');
          socketRef.current.off('message_sent');
          socketRef.current.off('conversation_updated');
          socketRef.current.disconnect();
        }
      };
    }
  }, [user?._id, token]);

  const handleOpenChat = (conversation) => {
    setSelectedConversation(conversation);
    setChatOpen(true);
  };
  const handleCloseChat = () => {
    setChatOpen(false);
    setSelectedConversation(null);
  };
  const handleLogout = () => {
    window.localStorage.removeItem('user');
    window.localStorage.removeItem('token');
    window.location.href = '/log-in';
  };
  if (!user || !token) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight={400} spacing={2}>
        <Typography variant="h6" color="text.secondary">Please log in to view your messages.</Typography>
        <Button variant="contained" color="primary" onClick={() => window.location.href = '/log-in'}>
          Go to Login
        </Button>
      </Stack>
    );
  }
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start" pt={5} width="100%" maxWidth={1200} mx="auto" px={2}>
      {/* Inbox Section */}
      <Box 
        flex={{ xs: 'none', md: 1 }} 
        minWidth={320} 
        maxWidth={380} 
        width={{ xs: '100%', md: 360 }}
        sx={{
          border: '1px solid #e3f2fd',
          borderRadius: '16px',
          backgroundColor: '#f7f9fb',
          boxShadow: '0 8px 32px rgba(25, 118, 210, 0.1)',
          overflow: 'hidden'
        }}
      >
        {/* Inbox Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)'
        }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: 'white' }}>
            Inbox
          </Typography>
          <Button 
            size="small" 
            onClick={fetchConversations} 
            disabled={loading}
            sx={{ 
              minWidth: 'auto',
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
            variant="outlined"
          >
            Refresh
          </Button>
        </div>
        {/* Inbox Content */}
        <div style={{
          padding: '16px',
          background: 'linear-gradient(135deg, #f7f9fb 0%, #e3f2fd 100%)',
          minHeight: '400px',
          maxHeight: '600px',
          overflowY: 'auto'
        }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
              {error.includes('user ID is invalid') && (
                <Button color="error" size="small" sx={{ ml: 2 }} onClick={handleLogout}>
                  Log Out
                </Button>
              )}
            </Alert>
          )}
          {loading ? (
            <Stack alignItems="center" justifyContent="center" minHeight={200}>
              <CircularProgress sx={{ color: '#1976d2' }} />
            </Stack>
          ) : conversations.length === 0 ? (
            <Stack alignItems="center" spacing={2} minHeight={200} justifyContent="center">
              <Typography color="text.secondary" align="center">No conversations yet.</Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Start a conversation by messaging someone about their lost or found item.
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={2}>
              {conversations.map((conv) => (
                <Paper
                  key={conv.id}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    background: selectedConversation?.id === conv.id 
                      ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' 
                      : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    border: selectedConversation?.id === conv.id 
                      ? '2px solid #1976d2' 
                      : '1px solid rgba(25, 118, 210, 0.1)',
                    borderRadius: '12px',
                    boxShadow: selectedConversation?.id === conv.id 
                      ? '0 4px 12px rgba(25, 118, 210, 0.2)' 
                      : '0 2px 8px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #f0f7ff 0%, #e3f2fd 100%)',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                  onClick={() => handleOpenChat(conv)}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar 
                      src={conv.otherUser.img} 
                      alt={conv.otherUser.nickname || conv.otherUser.fullname || 'User'}
                      sx={{ 
                        width: 48, 
                        height: 48,
                        background: 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
                        boxShadow: '0 2px 8px rgba(66, 165, 245, 0.3)'
                      }}
                    />
                    <Stack flex={1} minWidth={0}>
                      <Typography fontWeight="bold" noWrap sx={{ color: '#1976d2' }}>
                        {conv.otherUser.nickname || conv.otherUser.fullname || 'User'}
                      </Typography>
                      {conv.item && (
                        <Typography variant="body2" color="primary" noWrap sx={{ fontWeight: 500 }}>
                          Item: {conv.item.name}
                        </Typography>
                      )}
                      {conv.lastMessage && (
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.5 }}>
                          {conv.lastMessage.text}
                        </Typography>
                      )}
                    </Stack>
                    {conv.lastMessage && (
                      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>
                        {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                      </Typography>
                    )}
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </div>
      </Box>
      {/* Chat Section */}
      <Box flex={2} width="100%" minHeight={500}>
        {selectedConversation ? (
          <RealTimeChat
            currentUser={user}
            otherUser={selectedConversation.otherUser}
            itemId={selectedConversation.item ? selectedConversation.item._id : undefined}
          />
        ) : (
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              height: '500px',
              border: '1px solid #e3f2fd',
              borderRadius: '16px',
              backgroundColor: '#f7f9fb',
              boxShadow: '0 8px 32px rgba(25, 118, 210, 0.1)',
              overflow: 'hidden'
            }}
          >
            {/* Empty State Header */}
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
                💬
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '2px' }}>
                  Messages
                </div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>
                  Select a conversation to start chatting
                </div>
              </div>
            </div>
            {/* Empty State Content */}
            <div style={{
              flex: 1,
              padding: '20px',
              background: 'linear-gradient(135deg, #f7f9fb 0%, #e3f2fd 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Stack alignItems="center" spacing={2}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  color: '#1976d2'
                }}>
                  💬
                </div>
                <Typography color="text.secondary" variant="h6" textAlign="center">
                  Select a conversation to start chatting
                </Typography>
                <Typography color="text.secondary" variant="body2" textAlign="center">
                  Choose a conversation from the inbox to view and send messages
                </Typography>
              </Stack>
            </div>
          </Box>
        )}
      </Box>
      {/* Chat Modal for Mobile */}
      <Modal
        open={chatOpen && window.innerWidth < 768}
        onClose={handleCloseChat}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Box sx={{ 
          width: '100%', 
          maxWidth: 500, 
          bgcolor: 'background.paper', 
          borderRadius: 2, 
          p: 2,
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          {selectedConversation && (
            <RealTimeChat
              currentUser={user}
              otherUser={selectedConversation.otherUser}
              itemId={selectedConversation.item ? selectedConversation.item._id : undefined}
            />
          )}
          <Button 
            onClick={handleCloseChat} 
            variant="outlined" 
            sx={{ mt: 2, width: '100%' }}
          >
            Close Chat
          </Button>
        </Box>
      </Modal>
    </Stack>
  );
};

export default MyMessages;