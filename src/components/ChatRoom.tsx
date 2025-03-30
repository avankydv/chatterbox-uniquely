
import { useChat } from '@/context/ChatContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from './UserList';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const ChatRoom = () => {
  const { logout } = useChat();

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-chat-primary">ChatterBox</h1>
        <Button variant="outline" size="sm" onClick={logout} className="gap-1">
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-col flex-1 min-w-0">
          <MessageList />
          <MessageInput />
        </div>
        
        <div className="hidden md:block">
          <UserList />
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
