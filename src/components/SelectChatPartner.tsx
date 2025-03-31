
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useChat } from '@/context/ChatContext';
import { useToast } from '@/components/ui/use-toast';

const SelectChatPartner = () => {
  const { setTargetUsername, startChat, users, username } = useChat();
  const [inputValue, setInputValue] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputValue.trim() === username) {
      toast({
        title: "Invalid selection",
        description: "You cannot chat with yourself",
        variant: "destructive"
      });
      return;
    }
    
    const userExists = users.some(user => user.username === inputValue);
    
    if (!userExists) {
      toast({
        title: "User not found",
        description: "This user is not online. Please choose someone from the online users list.",
        variant: "destructive"
      });
      return;
    }
    
    // Set the target username and start the chat
    setTargetUsername(inputValue);
    startChat();
  };

  const handleUserClick = (username: string) => {
    // Set input value first
    setInputValue(username);
    
    // Then automatically submit the form to start the chat
    setTargetUsername(username);
    startChat();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-chat-tertiary to-white dark:from-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-lg animate-fade-in dark:bg-gray-800">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-chat-primary dark:text-white">ChatterBox</CardTitle>
          <CardDescription className="dark:text-gray-300">Start chatting with any online user</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Enter username"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="focus:border-chat-primary dark:bg-gray-700 dark:text-white"
                required
                minLength={2}
                maxLength={15}
                list="online-users"
              />
              <datalist id="online-users">
                {users
                  .filter(user => user.username !== username)
                  .map(user => (
                    <option key={user.id} value={user.username} />
                  ))}
              </datalist>
              
              <div className="mt-4">
                <h3 className="font-medium mb-2 dark:text-white">Online Users:</h3>
                <ul className="max-h-40 overflow-y-auto space-y-1">
                  {users
                    .filter(user => user.username !== username)
                    .map(user => (
                      <li 
                        key={user.id} 
                        className="px-3 py-2 rounded-md bg-chat-tertiary dark:bg-gray-700 flex items-center cursor-pointer hover:bg-chat-secondary/20 dark:hover:bg-gray-600"
                        onClick={() => handleUserClick(user.username)}
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="dark:text-white">{user.username}</span>
                      </li>
                    ))}
                    
                  {users.filter(user => user.username !== username).length === 0 && (
                    <li className="text-gray-500 dark:text-gray-400 text-sm italic">No other users online</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-chat-primary hover:bg-chat-secondary dark:bg-chat-primary dark:hover:bg-chat-secondary"
              disabled={inputValue.trim().length < 2}
            >
              Start Chat
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SelectChatPartner;
