
import { useChat } from '@/context/ChatContext';
import { Users } from 'lucide-react';

const UserList = () => {
  const { users } = useChat();

  return (
    <div className="h-full bg-white border-l border-gray-200 w-full md:w-64 p-4 overflow-auto">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-chat-primary" />
        <h2 className="font-semibold text-lg">Online Users ({users.length})</h2>
      </div>
      
      <ul className="space-y-2">
        {users.map((user) => (
          <li 
            key={user.id} 
            className="px-3 py-2 rounded-md bg-chat-tertiary flex items-center"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span>{user.username}</span>
          </li>
        ))}

        {users.length === 0 && (
          <li className="text-gray-500 text-sm italic">No users online</li>
        )}
      </ul>
    </div>
  );
};

export default UserList;
