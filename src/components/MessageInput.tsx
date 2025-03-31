
import { useState } from 'react';
import { useChat } from '@/context/ChatContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

const MessageInput = () => {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { sendMessage } = useChat();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isSending) {
      setIsSending(true);
      await sendMessage(text);
      setText('');
      // Small delay to prevent rapid consecutive submissions
      setTimeout(() => setIsSending(false), 500);
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
          disabled={isSending}
          autoFocus
        />
        <Button 
          type="submit" 
          disabled={!text.trim() || isSending}
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
