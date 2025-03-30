
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
    
    setTargetUsername(inputValue);
    startChat();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-chat-tertiary to-white p-4">
      <Card className="w-full max-w-md shadow-lg animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-chat-primary">ChatterBox</CardTitle>
          <CardDescription>Start chatting with any online user</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Enter username"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="focus:border-chat-primary"
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
                <h3 className="font-medium mb-2">Online Users:</h3>
                <ul className="max-h-40 overflow-y-auto space-y-1">
                  {users
                    .filter(user => user.username !== username)
                    .map(user => (
                      <li 
                        key={user.id} 
                        className="px-3 py-2 rounded-md bg-chat-tertiary flex items-center cursor-pointer hover:bg-chat-secondary/20"
                        onClick={() => setInputValue(user.username)}
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span>{user.username}</span>
                      </li>
                    ))}
                    
                  {users.filter(user => user.username !== username).length === 0 && (
                    <li className="text-gray-500 text-sm italic">No other users online</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-chat-primary hover:bg-chat-secondary"
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
