
import { useChat } from '@/context/ChatContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from './UserList';
import ConversationsList from './ConversationsList';
import { Button } from '@/components/ui/button';
import { LogOut, MessageCircle, Users } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { useIsMobile } from '@/hooks/use-mobile';

const ChatRoom = () => {
  const { logout, targetUsername, conversations } = useChat();
  const [showSidebar, setShowSidebar] = useState<'conversations' | 'users'>('conversations');
  const isMobile = useIsMobile();
  
  // Count total unread messages
  const totalUnreadCount = conversations.reduce((total, conv) => total + conv.unreadCount, 0);

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="bg-card border-b border-border p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-chat-primary">
          ChatterBox
          {targetUsername && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              Chatting with <span className="font-medium text-chat-secondary">{targetUsername}</span>
            </span>
          )}
        </h1>
        <div className="flex gap-2 items-center">
          <div className="hidden md:flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowSidebar('conversations')}
              className={`gap-1 relative ${showSidebar === 'conversations' ? 'bg-chat-tertiary' : ''}`}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Chats</span>
              {totalUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex-shrink-0 rounded-full bg-chat-primary text-white px-1.5 py-0.5 text-xs">
                  {totalUnreadCount}
                </span>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowSidebar('users')}
              className={`gap-1 ${showSidebar === 'users' ? 'bg-chat-tertiary' : ''}`}
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </Button>
          </div>
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={logout} className="gap-1">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-col flex-1 min-w-0">
          <MessageList />
          <MessageInput />
        </div>
        
        <div className="hidden md:block w-80 border-l border-border overflow-hidden bg-card/50">
          {showSidebar === 'users' ? <UserList /> : <ConversationsList />}
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
