
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useChat } from '@/context/ChatContext';
import { useSocket } from '@/context/SocketContext';
import { useToast } from '@/components/ui/use-toast';

const LoginForm = () => {
  const { username, setUsername, login, checkUsernameAvailability } = useChat();
  const { connected } = useSocket();
  const [inputValue, setInputValue] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputValue.trim().length < 2) {
      toast({
        title: "Invalid username",
        description: "Username must be at least 2 characters long",
        variant: "destructive"
      });
      return;
    }
    
    setIsCheckingUsername(true);
    
    try {
      const isAvailable = await checkUsernameAvailability(inputValue);
      if (isAvailable) {
        setUsername(inputValue);
        login();
      } else {
        toast({
          title: "Username unavailable",
          description: "This username is already taken. Please choose another one.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check username availability",
        variant: "destructive"
      });
    } finally {
      setIsCheckingUsername(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-chat-tertiary to-white p-4">
      <Card className="w-full max-w-md shadow-lg animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-chat-primary">ChatterBox</CardTitle>
          <CardDescription>Enter a username to join the chat</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Username"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="focus:border-chat-primary"
                required
                minLength={2}
                maxLength={15}
              />
              {!connected && (
                <p className="text-sm text-red-500">
                  Connecting to chat server...
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-chat-primary hover:bg-chat-secondary"
              disabled={!connected || inputValue.trim().length < 2 || isCheckingUsername}
            >
              {isCheckingUsername ? 'Checking availability...' : 'Join Chat'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LoginForm;
