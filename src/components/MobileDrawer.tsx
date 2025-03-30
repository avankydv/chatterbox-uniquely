
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Users } from 'lucide-react';
import UserList from './UserList';

const MobileDrawer = () => {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="md:hidden fixed bottom-4 right-4 z-10">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button className="rounded-full w-12 h-12 bg-chat-primary hover:bg-chat-secondary p-0 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="p-0">
          <UserList />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileDrawer;
