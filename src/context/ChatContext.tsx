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
  const [userId, setUserId] = useState('');

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

    const newUserId = generateId();
    setUserId(newUserId);
    
    // Track presence with Supabase Realtime
    socket.track({
      id: newUserId,
      username: username
    });
    
    // Add self to users list
    setUsers(prev => [...prev, { id: newUserId, username }]);
    
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
      // Untrack presence to indicate user left
      socket.untrack();
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
      userId,
      username,
      timestamp: Date.now(),
      type: 'message' as const
    };
    
    // Send message via Supabase Realtime broadcast
    socket.send({
      type: 'broadcast',
      event: 'message',
      payload: message
    });
    
    // Add message to local state
    setMessages(prev => [...prev, message]);
  };

  useEffect(() => {
    if (!socket) return;

    // Listen for messages and user events via Supabase Realtime broadcast
    const broadcastListener = socket.on('broadcast', { event: 'message' }, (payload) => {
      const message = payload.payload;
      
      // Only add messages from other users (not our own, since we already added those)
      if (message.userId !== userId) {
        setMessages(prev => [...prev, message]);
      }
    });

    // Listen for user joined events
    const userJoinedListener = socket.on('broadcast', { event: 'user_joined' }, (payload) => {
      const user = payload.payload;
      
      // Don't add ourselves again
      if (user.id !== userId) {
        setUsers(prev => {
          // Check if user is already in the list
          if (!prev.some(u => u.id === user.id)) {
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
            return [...prev, user];
          }
          return prev;
        });
      }
    });

    // Listen for user left events
    const userLeftListener = socket.on('broadcast', { event: 'user_left' }, (payload) => {
      const user = payload.payload;
      
      // Don't handle our own leave event
      if (user.id !== userId) {
        setUsers(prev => {
          const newUsers = prev.filter(u => u.id !== user.id);
          
          // Only add the notification if the user was actually removed
          if (newUsers.length < prev.length) {
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
          }
          
          return newUsers;
        });
      }
    });

    // When a user joins, sync with existing users in the channel
    socket.on('presence', { event: 'sync' }, () => {
      const newState = socket.presenceState();
      
      // Convert presence state to user array
      const onlineUsers: User[] = [];
      Object.keys(newState).forEach(key => {
        newState[key].forEach((presence: User) => {
          if (presence.id !== userId) {
            onlineUsers.push(presence);
          }
        });
      });
      
      // Update users state with online users
      setUsers(prev => {
        // Keep our user and add other online users
        const ourUser = prev.find(u => u.id === userId);
        return ourUser ? [ourUser, ...onlineUsers] : onlineUsers;
      });
    });

    return () => {
      // No need to explicitly remove listeners, as they'll be cleaned up when the socket is unsubscribed
    };
  }, [socket, userId, generateId]);

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
