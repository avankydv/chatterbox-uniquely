
import { useEffect, useRef } from 'react';
import { useChat, Message } from '@/context/ChatContext';
import { format } from 'date-fns';

const getUserColor = (userId: string): string => {
  const colors = ['chat-user1', 'chat-user2', 'chat-user3', 'chat-user4', 'chat-user5'];
  // Hash the userId to consistently get the same color for a user
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const MessageList = () => {
  const { messages, username } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderMessage = (message: Message) => {
    const isCurrentUser = message.username === username;
    const isNotification = message.type === 'notification';
    
    if (isNotification) {
      return (
        <div key={message.id} className="flex justify-center my-2">
          <div className="bg-muted text-muted-foreground px-4 py-2 rounded-full text-sm">
            {message.text}
          </div>
        </div>
      );
    }
    
    const userColor = getUserColor(message.userId);
    
    return (
      <div 
        key={message.id} 
        className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
      >
        <div className={`max-w-xs md:max-w-md lg:max-w-lg ${isCurrentUser ? 'order-1' : 'order-2'}`}>
          <div className="flex items-end">
            {!isCurrentUser && (
              <div className="flex flex-col items-start mr-2 text-xs text-muted-foreground">
                <span>{message.username}</span>
              </div>
            )}
            <div 
              className={`px-4 py-2 rounded-lg ${
                isCurrentUser 
                  ? 'bg-chat-primary text-primary-foreground rounded-br-none' 
                  : `bg-${userColor} text-foreground rounded-bl-none`
              }`}
            >
              <p>{message.text}</p>
              <div className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                {format(new Date(message.timestamp), 'HH:mm')}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-background">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map(renderMessage)
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
