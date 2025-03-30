
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';
import { useToast } from '@/components/ui/use-toast';

export interface User {
  id: string;
  username: string;
}

export interface Message {
  id: string;
  text: string;
  userId: string;
  username: string;
  timestamp: number;
  type: 'message' | 'notification';
}

interface ChatContextType {
  username: string;
  setUsername: (username: string) => void;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  users: User[];
  messages: Message[];
  sendMessage: (text: string) => void;
}

const ChatContext = createContext<ChatContextType>({
  username: '',
  setUsername: () => {},
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
  users: [],
  messages: [],
  sendMessage: () => {},
});

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { socket, connected } = useSocket();
  const { toast } = useToast();
  
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const generateId = () => {
    return Math.random().toString(36).substring(2, 9);
  };

  const login = () => {
    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username to join the chat",
        variant: "destructive"
      });
      return;
    }

    if (!socket || !connected) {
      toast({
        title: "Connection error",
        description: "Could not connect to chat server",
        variant: "destructive"
      });
      return;
    }

    const userId = generateId();
    
    // Emit join event to server
    socket.emit('join', { userId, username });
    
    // Add self to users list
    setUsers(prev => [...prev, { id: userId, username }]);
    
    // Add join notification to messages
    setMessages(prev => [
      ...prev,
      {
        id: generateId(),
        text: `You joined the chat`,
        userId: 'system',
        username: 'System',
        timestamp: Date.now(),
        type: 'notification'
      }
    ]);
    
    setIsLoggedIn(true);
    
    toast({
      title: "Welcome to the chat!",
      description: `You've joined as ${username}`,
    });
  };

  const logout = () => {
    if (socket && connected) {
      socket.emit('leave', { username });
    }
    setIsLoggedIn(false);
    setUsers([]);
    setMessages([]);
  };

  const sendMessage = (text: string) => {
    if (!text.trim() || !socket || !connected || !isLoggedIn) return;
    
    const message = {
      id: generateId(),
      text,
      userId: socket.id,
      username,
      timestamp: Date.now(),
      type: 'message' as const
    };
    
    socket.emit('message', message);
    
    // Add message to local state
    setMessages(prev => [...prev, message]);
  };

  useEffect(() => {
    if (!socket) return;

    // Listen for new users
    socket.on('user_joined', (user: User) => {
      setUsers(prev => [...prev, user]);
      setMessages(prev => [
        ...prev,
        {
          id: generateId(),
          text: `${user.username} joined the chat`,
          userId: 'system',
          username: 'System',
          timestamp: Date.now(),
          type: 'notification'
        }
      ]);
    });

    // Listen for users leaving
    socket.on('user_left', (user: User) => {
      setUsers(prev => prev.filter(u => u.id !== user.id));
      setMessages(prev => [
        ...prev,
        {
          id: generateId(),
          text: `${user.username} left the chat`,
          userId: 'system',
          username: 'System',
          timestamp: Date.now(),
          type: 'notification'
        }
      ]);
    });

    // Listen for new messages
    socket.on('message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for active users
    socket.on('active_users', (activeUsers: User[]) => {
      setUsers(activeUsers);
    });

    // Listen for message history
    socket.on('message_history', (history: Message[]) => {
      setMessages(history);
    });

    // Cleanup
    return () => {
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('message');
      socket.off('active_users');
      socket.off('message_history');
    };
  }, [socket, generateId]);

  return (
    <ChatContext.Provider
      value={{
        username,
        setUsername,
        isLoggedIn,
        login,
        logout,
        users,
        messages,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
