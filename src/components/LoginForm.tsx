
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useChat } from '@/context/ChatContext';
import { useSocket } from '@/context/SocketContext';

const LoginForm = () => {
  const { username, setUsername, login } = useChat();
  const { connected } = useSocket();
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUsername(inputValue);
    login();
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
              disabled={!connected || inputValue.trim().length < 2}
            >
              Join Chat
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LoginForm;
