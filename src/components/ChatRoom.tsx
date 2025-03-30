
import { useChat } from '@/context/ChatContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from './UserList';
import ConversationsList from './ConversationsList';
import { Button } from '@/components/ui/button';
import { LogOut, MessageCircle, Users } from 'lucide-react';
import { useState } from 'react';

const ChatRoom = () => {
  const { logout, targetUsername } = useChat();
  const [showSidebar, setShowSidebar] = useState<'conversations' | 'users'>('users');

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-chat-primary">
          ChatterBox
          {targetUsername && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              Chatting with <span className="font-medium text-chat-secondary">{targetUsername}</span>
            </span>
          )}
        </h1>
        <div className="flex gap-2">
          <div className="hidden md:flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowSidebar('conversations')}
              className={`gap-1 ${showSidebar === 'conversations' ? 'bg-chat-tertiary' : ''}`}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Conversations</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowSidebar('users')}
              className={`gap-1 ${showSidebar === 'users' ? 'bg-chat-tertiary' : ''}`}
            >
              <Users className="h-4 w-4" />
              <span>Users</span>
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={logout} className="gap-1">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-col flex-1 min-w-0">
          <MessageList />
          <MessageInput />
        </div>
        
        <div className="hidden md:block">
          {showSidebar === 'users' ? <UserList /> : <ConversationsList />}
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
