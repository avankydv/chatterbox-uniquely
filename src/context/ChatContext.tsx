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
  targetUsername?: string;
}

interface Conversation {
  partnerUsername: string;
  messages: Message[];
}

interface ChatContextType {
  username: string;
  setUsername: (username: string) => void;
  targetUsername: string;
  setTargetUsername: (username: string) => void;
  isLoggedIn: boolean;
  isInChat: boolean;
  login: () => void;
  logout: () => void;
  startChat: () => void;
  switchConversation: (username: string) => void;
  users: User[];
  messages: Message[];
  conversations: Conversation[];
  sendMessage: (text: string) => Promise<void>;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
}

const ChatContext = createContext<ChatContextType>({
  username: '',
  setUsername: () => {},
  targetUsername: '',
  setTargetUsername: () => {},
  isLoggedIn: false,
  isInChat: false,
  login: () => {},
  logout: () => {},
  startChat: () => {},
  switchConversation: () => {},
  users: [],
  messages: [],
  conversations: [],
  sendMessage: async () => {},
  checkUsernameAvailability: async () => true,
});

export const useChat = () => useContext(ChatContext);

// Local storage key for saving conversations
const CHAT_STORAGE_KEY = 'chatterbox_conversations';

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { socket, connected } = useSocket();
  const { toast } = useToast();
  
  const [username, setUsername] = useState('');
  const [targetUsername, setTargetUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInChat, setIsInChat] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [userId, setUserId] = useState('');
  // Track processed message IDs to prevent duplicates
  const [processedMessageIds, setProcessedMessageIds] = useState<Set<string>>(new Set());

  // Load conversations from localStorage when component mounts
  useEffect(() => {
    try {
      const savedConversations = localStorage.getItem(CHAT_STORAGE_KEY);
      if (savedConversations) {
        setConversations(JSON.parse(savedConversations));
      }
    } catch (error) {
      console.error('Error loading conversations from localStorage:', error);
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversations));
      } catch (error) {
        console.error('Error saving conversations to localStorage:', error);
      }
    }
  }, [conversations]);

  const generateId = () => {
    return Math.random().toString(36).substring(2, 9);
  };

  const checkUsernameAvailability = async (usernameToCheck: string): Promise<boolean> => {
    if (!socket || !connected) {
      throw new Error("Not connected to server");
    }
    
    // Check if the username is already in the users list
    return !users.some(user => 
      user.username.toLowerCase() === usernameToCheck.toLowerCase()
    );
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

  const startChat = () => {
    if (!targetUsername) {
      toast({
        title: "Select a user",
        description: "Please select a user to chat with",
        variant: "destructive"
      });
      return;
    }

    // Check if conversation already exists
    if (!conversations.some(conv => conv.partnerUsername === targetUsername)) {
      // Create a new conversation
      setConversations(prev => [...prev, {
        partnerUsername: targetUsername,
        messages: []
      }]);
    }

    // Set current messages to the selected conversation
    const conversationMessages = conversations.find(
      conv => conv.partnerUsername === targetUsername
    )?.messages || [];
    
    setMessages([
      {
        id: generateId(),
        text: `You started a chat with ${targetUsername}`,
        userId: 'system',
        username: 'System',
        timestamp: Date.now(),
        type: 'notification'
      },
      ...conversationMessages
    ]);
    
    setIsInChat(true);
    
    toast({
      title: "Chat started",
      description: `You are now chatting with ${targetUsername}`,
    });
  };

  const switchConversation = (partnerUsername: string) => {
    setTargetUsername(partnerUsername);
    
    // Get conversation messages or create a new conversation
    const conversation = conversations.find(
      conv => conv.partnerUsername === partnerUsername
    );
    
    if (conversation) {
      setMessages([
        {
          id: generateId(),
          text: `You switched to chat with ${partnerUsername}`,
          userId: 'system',
          username: 'System',
          timestamp: Date.now(),
          type: 'notification'
        },
        ...conversation.messages
      ]);
    } else {
      setMessages([
        {
          id: generateId(),
          text: `You started a chat with ${partnerUsername}`,
          userId: 'system',
          username: 'System',
          timestamp: Date.now(),
          type: 'notification'
        }
      ]);
      
      // Create a new conversation
      setConversations(prev => [...prev, {
        partnerUsername,
        messages: []
      }]);
    }
    
    toast({
      title: "Chat switched",
      description: `You are now chatting with ${partnerUsername}`,
    });
  };

  const logout = () => {
    if (socket && connected) {
      // Untrack presence to indicate user left
      socket.untrack();
    }
    
    setIsLoggedIn(false);
    setIsInChat(false);
    setTargetUsername('');
    setUsers([]);
    setMessages([]);
    // Don't clear conversations to keep history
    
    // Clear processed message IDs
    setProcessedMessageIds(new Set());
  };

  const sendMessage = async (text: string): Promise<void> => {
    if (!text.trim() || !socket || !connected || !isLoggedIn || !isInChat || !targetUsername) return;
    
    const messageId = generateId();
    
    const message = {
      id: messageId,
      text,
      userId,
      username,
      timestamp: Date.now(),
      type: 'message' as const,
      targetUsername // Include the target username
    };
    
    // Add to processed message IDs immediately to prevent duplicates
    setProcessedMessageIds(prev => new Set([...prev, messageId]));
    
    // Send message via Supabase Realtime broadcast
    socket.send({
      type: 'broadcast',
      event: 'message',
      payload: message
    });
    
    // Add message to local state
    setMessages(prev => [...prev, message]);
    
    // Update the conversation
    setConversations(prev => 
      prev.map(conv => {
        if (conv.partnerUsername === targetUsername) {
          return {
            ...conv,
            messages: [...conv.messages, message]
          };
        }
        return conv;
      })
    );
    
    // Return a resolved promise to allow awaiting the send operation
    return Promise.resolve();
  };

  useEffect(() => {
    if (!socket) return;

    // Listen for messages and user events via Supabase Realtime broadcast
    const broadcastListener = socket.on('broadcast', { event: 'message' }, (payload) => {
      const message = payload.payload;
      
      // Check if we've already processed this message
      if (processedMessageIds.has(message.id)) {
        return;
      }
      
      // Only add messages from other users (not our own, since we already added those)
      if (message.userId !== userId) {
        // Check if this message is for us
        if (message.targetUsername === username) {
          // Add to processed message IDs
          setProcessedMessageIds(prev => new Set([...prev, message.id]));
          
          // Add to appropriate conversation or create new one
          const senderUsername = message.username;
          
          setConversations(prev => {
            const existingConversationIndex = prev.findIndex(
              conv => conv.partnerUsername === senderUsername
            );
            
            if (existingConversationIndex >= 0) {
              // Update existing conversation
              const newConversations = [...prev];
              newConversations[existingConversationIndex] = {
                ...newConversations[existingConversationIndex],
                messages: [...newConversations[existingConversationIndex].messages, message]
              };
              return newConversations;
            } else {
              // Create new conversation
              return [...prev, {
                partnerUsername: senderUsername,
                messages: [message]
              }];
            }
          });
          
          // If this is from our current chat partner, add to current messages
          if (senderUsername === targetUsername) {
            setMessages(prev => [...prev, message]);
          } else {
            // Notify about new message from someone else
            toast({
              title: "New message",
              description: `You received a message from ${senderUsername}`,
            });
          }
        }
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
      
      // Process each presence in the state object
      Object.keys(newState).forEach(key => {
        // Each presence entry contains an array of presence objects
        const presences = newState[key] as unknown as Array<any>;
        
        // Process each presence object in the array
        presences.forEach((presenceData) => {
          // Only extract and process if it has the expected properties
          if (presenceData && typeof presenceData === 'object' && 
              'id' in presenceData && 'username' in presenceData) {
            
            // Skip ourselves
            if (presenceData.id !== userId) {
              onlineUsers.push({
                id: presenceData.id,
                username: presenceData.username
              });
            }
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
  }, [socket, userId, username, targetUsername, toast, processedMessageIds]);

  return (
    <ChatContext.Provider
      value={{
        username,
        setUsername,
        targetUsername,
        setTargetUsername,
        isLoggedIn,
        isInChat,
        login,
        logout,
        startChat,
        switchConversation,
        users,
        messages,
        conversations,
        sendMessage,
        checkUsernameAvailability
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
