import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { getNotifications, clearAllNotifications as clearAllNotificationsApi, markAllAsRead as markAllAsReadApi, markNotificationRead, NotificationData } from "../services/notificationService";

type SocketContextValue = {
  socket: Socket | null;
  connected: boolean;
  notifications: NotificationData[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markAllRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
};

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
  notifications: [],
  unreadCount: 0,
  refreshNotifications: async () => {},
  markAllRead: async () => {},
  clearAll: async () => {},
  markRead: async () => {},
});

const mapEventToNotification = (eventName: string, payload: any): NotificationData => {
  const orderId = payload?.orderId || payload?.id || "unknown";
  const base = {
    id: payload?.id || `${eventName}_${Date.now()}`,
    timestamp: new Date().toISOString(),
    read: false,
    meta: payload || {},
  };

  switch (eventName) {
    case "notification_created":
      return {
        ...base,
        id: payload?.id || `${eventName}_${Date.now()}`,
        title: payload?.title || "Notification",
        message: payload?.message || "You have a new update.",
        type: "created",
      };
    case "order_created":
      return {
        ...base,
        title: "Order Created",
        message: `Order ${orderId} has been created successfully.`,
        type: "created",
      };
    case "order_accepted":
      return {
        ...base,
        title: "Order Accepted",
        message: `Order ${orderId} has been accepted and queued.`,
        type: "accepted",
      };
    case "order_printing":
      return {
        ...base,
        title: "Printing Started",
        message: `Order ${orderId} is now printing.`,
        type: "printing",
      };
    case "order_ready":
      return {
        ...base,
        title: "Ready for Pickup",
        message: `Order ${orderId} is ready for pickup.`,
        type: "ready",
      };
    case "order_collected":
      return {
        ...base,
        title: "Order Collected",
        message: `Order ${orderId} was collected.`,
        type: "ready",
      };
    case "priority_requested":
      return {
        ...base,
        title: "Priority Requested",
        message: `Priority request submitted for order ${orderId}.`,
        type: "priority_requested",
      };
    case "priority_approved":
      return {
        ...base,
        title: "Priority Approved",
        message: `Priority request approved for order ${orderId}.`,
        type: "priority_approved",
      };
    case "priority_rejected":
      return {
        ...base,
        title: "Priority Rejected",
        message: `Priority request rejected for order ${orderId}.`,
        type: "priority_rejected",
      };
    case "printer_status_changed":
      return {
        ...base,
        title: "Printer Status Changed",
        message: payload?.message || "Printer status updated.",
        type: "printer_status_changed",
      };
    default:
      return {
        ...base,
        title: eventName,
        message: payload?.message || "New update received.",
        type: "created",
      };
  }
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const refreshNotifications = async () => {
    const list = await getNotifications();
    setNotifications(list);
  };

  const upsertNotification = (item: NotificationData) => {
    setNotifications((prev) => {
      const filtered = prev.filter((n) => n.id !== item.id);
      return [item, ...filtered];
    });
  };

  const markAllRead = async () => {
    const updated = await markAllAsReadApi();
    setNotifications(updated);
  };

  const clearAll = async () => {
    await clearAllNotificationsApi();
    setNotifications([]);
  };

  const markRead = async (id: string) => {
    const updated = await markNotificationRead(id);
    if (updated) {
      setNotifications((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    }
  };

  useEffect(() => {
    let mounted = true;

    const connect = async () => {
      if (!isSignedIn || !user) {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
        setSocket(null);
        setConnected(false);
        setNotifications([]);
        return;
      }

      const token = await getToken();
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || "http://10.1.48.225:5000/api";
      const socketUrl = baseUrl.replace(/\/api\/?$/, "");

      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      const s = io(socketUrl, {
        transports: ["websocket"],
        reconnection: true,
        auth: {
          token,
          clerkUserId: user.id,
        },
      });

      socketRef.current = s;
      setSocket(s);

      s.on("connect", () => setConnected(true));
      s.on("disconnect", () => setConnected(false));

      const handleEvent = (eventName: string, payload: any) => {
        const notification = mapEventToNotification(eventName, payload);
        upsertNotification(notification);
      };

      const events = [
        "notification_created",
        "order_created",
        "order_accepted",
        "order_printing",
        "order_ready",
        "order_collected",
        "priority_requested",
        "priority_approved",
        "priority_rejected",
        "printer_status_changed",
      ];

      events.forEach((eventName) => {
        s.on(eventName, (payload) => handleEvent(eventName, payload));
      });

      try {
        await refreshNotifications();
      } catch (e) {
        console.warn("Failed to load notifications", e);
      }
    };

    connect();

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (!mounted) return;
    };
  }, [isSignedIn, user, getToken]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        notifications,
        unreadCount,
        refreshNotifications,
        markAllRead,
        clearAll,
        markRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);