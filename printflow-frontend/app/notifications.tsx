import React, { useEffect, useState } from "react";
import { View, Text, FlatList, RefreshControl, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { AppHeader } from "../components/AppHeader";
import { NotificationItem, NotificationItemProps } from "../components/NotificationItem";
import { AppEmptyState } from "../components/AppEmptyState";
import { getNotifications, markAllAsRead, clearAllNotifications, NotificationData } from "../services/notificationService";
import { trackEvent } from "../utils/posthog";

export default function Notifications() {
  const { tw, colors } = useTheme();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const list = await getNotifications();
      setNotifications(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    trackEvent("screen_viewed", { screenName: "notifications" });
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
      const updated = await markAllAsRead();
      setNotifications(updated);
      trackEvent("feature_used", { featureName: "mark_all_notifications_read" });
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      setNotifications([]);
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={tw("flex-1 bg-background")}>
      <AppHeader
        title="Notifications"
        showBack
        rightElement={
          notifications.length > 0 ? (
            <Pressable
              onPress={handleMarkAllRead}
              style={tw("px-3 py-2 border border-border rounded-xl bg-card mr-2")}
              accessibilityRole="button"
              accessibilityLabel="Mark all as read"
            >
              <Text style={tw("text-xs font-inter-semibold text-emerald-500 font-bold")}>
                Mark Read
              </Text>
            </Pressable>
          ) : undefined
        }
      />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
        contentContainerStyle={tw("pb-10 flex-grow")}
        renderItem={({ item }) => (
          <NotificationItem
            title={item.title}
            message={item.message}
            type={item.type}
            timestamp={item.timestamp}
            read={item.read}
          />
        )}
        ListEmptyComponent={
          <AppEmptyState
            icon="bell"
            title="No Notifications"
            description="You are all caught up! There are no new printing alerts or updates."
          />
        }
      />
    </View>
  );
}
