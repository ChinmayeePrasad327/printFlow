import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { NotificationsService } from '../../services/notifications';

type SocketContextType = {
  socket: Socket | null;
  connected: boolean;
  notifications: any[];
  unreadCount: number;
};

const SocketContext = createContext<SocketContextType>({ socket: null, connected: false, notifications: [], unreadCount: 0 });

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    let s: Socket | null = socket;
    let mounted = true;

    const setup = async () => {
      if (!isSignedIn || !user) return;
      if (s) return; // prevent duplicate
      const token = await getToken();
      const backend = process.env.API_BASE_URL || 'https://your-backend.example.com';
      s = io(backend, {
        auth: { token, clerkUserId: user.id },
        transports: ['websocket'],
        reconnection: true,
      });
      setSocket(s);

      s.on('connect', () => { setConnected(true); });
      s.on('disconnect', () => { setConnected(false); });

      // notification event
      s.on('notification_created', (n: any) => {
        setNotifications(prev => [n, ...prev]);
      });

      // order events also push notifications
      const orderEvents = ['order_created','order_accepted','order_printing','order_ready','order_collected','priority_requested','priority_approved','priority_rejected','printer_status_changed'];
      orderEvents.forEach(ev => {
        s!.on(ev, (payload:any) => {
          // create local notification summary
          const n = { title: ev.replace('_',' '), message: JSON.stringify(payload), createdAt: new Date() };
          setNotifications(prev => [n, ...prev]);
        });
      });

      // fetch historical notifications
      try {
        const res = await NotificationsService.list();
        if (mounted && res && res.data) setNotifications(res.data);
      } catch (e) { console.warn('Fetch notifs failed', e); }
    };

    setup();

    return () => {
      mounted = false;
      if (s) {
        s.disconnect();
        setSocket(null);
      }
    };
  }, [isSignedIn, user]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  return (
    <SocketContext.Provider value={{ socket, connected, notifications, unreadCount }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
