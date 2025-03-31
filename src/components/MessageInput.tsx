
import { useState } from 'react';
import { useChat } from '@/context/ChatContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

const MessageInput = () => {
  const [text, setText] = useState('');
  const { sendMessage } = useChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      sendMessage(text);
      setText('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="p-3 md:p-4 border-t border-border bg-card"
    >
      <div className="flex space-x-2 items-center">
        <Input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow"
          autoFocus
        />
        <Button 
          type="submit" 
          disabled={!text.trim()}
          className="bg-chat-primary hover:bg-chat-secondary text-primary-foreground"
          size="icon"
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </form>
  );
};

export default MessageInput;
