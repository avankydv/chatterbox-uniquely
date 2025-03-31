
import { SocketProvider } from '@/context/SocketContext';
import { ChatProvider, useChat } from '@/context/ChatContext';
import LoginForm from '@/components/LoginForm';
import ChatRoom from '@/components/ChatRoom';
import MobileDrawer from '@/components/MobileDrawer';
import SelectChatPartner from '@/components/SelectChatPartner';

const ChatApp = () => {
  const { isLoggedIn, isInChat, targetUsername } = useChat();

  // Debugging the state
  console.log("App state:", { isLoggedIn, isInChat, targetUsername });

  return (
    <>
      {!isLoggedIn ? (
        <LoginForm />
      ) : !isInChat ? (
        <SelectChatPartner />
      ) : (
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
