
import { useChat, Conversation } from '@/context/ChatContext';
import { MessageCircle } from 'lucide-react';
import { format, isToday, isYesterday, isThisYear } from 'date-fns';

const ConversationsList = () => {
  const { conversations, switchConversation, targetUsername } = useChat();

  // Sort conversations by latest message time
  const sortedConversations = [...conversations].sort((a, b) => 
    b.lastMessageTime - a.lastMessageTime
  );

  const formatMessageTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else if (isThisYear(date)) {
      return format(date, 'dd MMM');
    } else {
      return format(date, 'dd.MM.yy');
    }
  };

  const getLastMessagePreview = (conversation: Conversation): string => {
    const messages = conversation.messages;
    if (messages.length === 0) return 'No messages yet';
    
    const lastMessage = messages[messages.length - 1];
    // Truncate message if it's too long
    return lastMessage.text.length > 25 
      ? `${lastMessage.text.substring(0, 25)}...` 
      : lastMessage.text;
  };

  return (
    <div className="h-full bg-card border-l border-border w-full md:w-64 p-4 overflow-auto">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-5 w-5 text-chat-primary" />
        <h2 className="font-semibold text-lg">Chats ({conversations.length})</h2>
      </div>
      
      <ul className="space-y-2">
        {sortedConversations.map((conversation) => (
          <li 
            key={conversation.partnerUsername} 
            className={`px-3 py-2 rounded-md flex items-center cursor-pointer hover:bg-chat-secondary/20 ${
              targetUsername === conversation.partnerUsername ? 'bg-chat-primary/10 font-medium' : 'bg-chat-tertiary'
            }`}
            onClick={() => switchConversation(conversation.partnerUsername)}
          >
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex justify-between items-center">
                <span className="font-medium truncate">{conversation.partnerUsername}</span>
                <span className="text-xs text-muted-foreground">
                  {formatMessageTime(conversation.lastMessageTime)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground truncate">
                  {getLastMessagePreview(conversation)}
                </span>
                {conversation.unreadCount > 0 && (
                  <span className="ml-1 flex-shrink-0 rounded-full bg-chat-primary text-white px-1.5 py-0.5 text-xs">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}

        {conversations.length === 0 && (
          <li className="text-muted-foreground text-sm italic">No active conversations</li>
        )}
      </ul>
    </div>
  );
};

export default ConversationsList;
