
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';

// Define custom types to replace Socket.io with Supabase Realtime
interface SocketContextType {
  socket: RealtimeChannel | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<RealtimeChannel | null>(null);
  const [connected, setConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Create a Supabase Realtime channel
    const channel = supabase.channel('public:chat_room', {
      config: {
        broadcast: { self: true },
      },
    });

    // Setup channel events
    channel
      .on('presence', { event: 'sync' }, () => {
        console.log('Connected to Supabase Realtime');
        setConnected(true);
        toast({
          title: "Connected to chat server",
          description: "You are now connected to the chat server",
        });
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('Join event:', key, newPresences);
        
        // We'll handle actual join events in the ChatContext
        if (socket) {
          socket.send({
            type: 'broadcast',
            event: 'user_joined',
            payload: newPresences[0]
          });
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('Leave event:', key, leftPresences);
        
        // We'll handle actual leave events in the ChatContext
        if (socket) {
          socket.send({
            type: 'broadcast',
            event: 'user_left',
            payload: leftPresences[0]
          });
        }
      })
      .on('broadcast', { event: 'message' }, (payload) => {
        console.log('Received message:', payload);
        // Message handling will be done in ChatContext
      })
      .on('broadcast', { event: 'user_joined' }, (payload) => {
        console.log('User joined broadcast:', payload);
        // User joined handling will be done in ChatContext
      })
      .on('broadcast', { event: 'user_left' }, (payload) => {
        console.log('User left broadcast:', payload);
        // User left handling will be done in ChatContext
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setConnected(true);
          console.log('Successfully subscribed to chat room');
        } else {
          console.error('Failed to subscribe to chat room:', status);
          setConnected(false);
          toast({
            title: "Connection error",
            description: "Failed to connect to chat server",
            variant: "destructive"
          });
        }
      });

    setSocket(channel);

    return () => {
      // Clean up the channel subscription
      channel.unsubscribe();
      setConnected(false);
    };
  }, [toast]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
