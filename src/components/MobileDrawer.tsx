
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';
import UserList from './UserList';
import ConversationsList from './ConversationsList';
import { Menu, MessageCircle, Users } from 'lucide-react';

const MobileDrawer = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'conversations'>('users');

  return (
    <div className="md:hidden fixed bottom-4 right-4 z-10">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" className="rounded-full h-12 w-12 shadow-lg bg-chat-primary hover:bg-chat-secondary">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>ChatterBox</SheetTitle>
            <SheetDescription>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('conversations')}
                  className={`flex-1 ${activeTab === 'conversations' ? 'bg-chat-tertiary' : ''}`}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Conversations
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('users')}
                  className={`flex-1 ${activeTab === 'users' ? 'bg-chat-tertiary' : ''}`}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Users
                </Button>
              </div>
            </SheetDescription>
          </SheetHeader>
          <div className="h-[calc(100vh-120px)]">
            {activeTab === 'users' ? <UserList /> : <ConversationsList />}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileDrawer;
