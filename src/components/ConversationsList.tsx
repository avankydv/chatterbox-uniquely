
import { useChat } from '@/context/ChatContext';
import { MessageCircle } from 'lucide-react';

const ConversationsList = () => {
  const { conversations, switchConversation, targetUsername } = useChat();

  return (
    <div className="h-full bg-white border-l border-gray-200 w-full md:w-64 p-4 overflow-auto">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-5 w-5 text-chat-primary" />
        <h2 className="font-semibold text-lg">Conversations ({conversations.length})</h2>
      </div>
      
      <ul className="space-y-2">
        {conversations.map((conversation) => (
          <li 
            key={conversation.partnerUsername} 
            className={`px-3 py-2 rounded-md flex items-center cursor-pointer hover:bg-chat-secondary/20 ${
              targetUsername === conversation.partnerUsername ? 'bg-chat-primary/10 font-medium' : 'bg-chat-tertiary'
            }`}
            onClick={() => switchConversation(conversation.partnerUsername)}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span>{conversation.partnerUsername}</span>
          </li>
        ))}

        {conversations.length === 0 && (
          <li className="text-gray-500 text-sm italic">No active conversations</li>
        )}
      </ul>
    </div>
  );
};

export default ConversationsList;
