
import { SocketProvider } from '@/context/SocketContext';
import { ChatProvider, useChat } from '@/context/ChatContext';
import LoginForm from '@/components/LoginForm';
import ChatRoom from '@/components/ChatRoom';
import MobileDrawer from '@/components/MobileDrawer';

const ChatApp = () => {
  const { isLoggedIn } = useChat();

  return (
    <>
      {!isLoggedIn ? <LoginForm /> : (
        <>
          <ChatRoom />
          <MobileDrawer />
        </>
      )}
    </>
  );
};

const Index = () => {
  return (
    <SocketProvider>
      <ChatProvider>
        <ChatApp />
      </ChatProvider>
    </SocketProvider>
  );
};

export default Index;
