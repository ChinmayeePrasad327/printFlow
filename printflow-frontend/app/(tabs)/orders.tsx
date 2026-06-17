import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, Pressable, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAppAuth } from "../../context/AuthContext";
import { AppHeader } from "../../components/AppHeader";
import { OrderCard } from "../../components/OrderCard";
import { AppEmptyState } from "../../components/AppEmptyState";
import { SkeletonCard } from "../../components/AppLoader";
import { getOrders } from "../../services/orderService";
import { trackEvent } from "../../utils/posthog";

type FilterType = "all" | "active" | "completed" | "cancelled";

export default function Orders() {
  const { dbUser } = useAppAuth();
  const { tw, colors } = useTheme();
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const fetchOrdersList = async () => {
    setLoading(true);
    try {
      const response = await getOrders();
      if (response && response.success && response.data) {
        setOrders(response.data);
      } else {
        // Mock fallback
        loadMockOrders();
      }
    } catch (e) {
      console.warn("Failed to fetch orders, loading mock data (Demo Mode)", e);
      loadMockOrders();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMockOrders = () => {
    setOrders([
      {
        _id: "order_1",
        fileName: "CS_301_MachineLearning_Assignment.pdf",
        status: "pending",
        queuePosition: 2,
        eta: 8,
        estimatedCost: 15.0,
        printerId: { name: "Library Printer A", location: "Library Floor 1" },
        createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
      },
      {
        _id: "order_2",
        fileName: "FinalYearProject_Draft.pdf",
        status: "printing",
        queuePosition: 1,
        eta: 3,
        estimatedCost: 85.5,
        printerId: { name: "CSE Lab Printer B", location: "CSE Block B" },
        createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
      },
      {
        _id: "order_3",
        fileName: "Hostel_AdmissionForm.pdf",
        status: "ready",
        queuePosition: 0,
        eta: 0,
        estimatedCost: 10.0,
        printerId: { name: "Admin Block C", location: "Ground Floor" },
        createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
      },
      {
        _id: "order_4",
        fileName: "Resume_Chinmayee.pdf",
        status: "cancelled",
        queuePosition: 0,
        eta: 0,
        estimatedCost: 5.0,
        printerId: { name: "Library Printer A", location: "Library Floor 1" },
        createdAt: new Date(Date.now() - 240 * 60000).toISOString(),
      },
    ]);
  };

  useEffect(() => {
    fetchOrdersList();
    trackEvent("screen_viewed", { screenName: "orders" });
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrdersList();
  };

  // Filter and Search logic
  const filteredOrders = React.useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = order.fileName.toLowerCase().includes(search.toLowerCase());
      
      let matchesFilter = true;
      if (filter === "active") {
        matchesFilter = ["pending", "accepted", "printing"].includes(order.status);
      } else if (filter === "completed") {
        matchesFilter = ["ready", "collected"].includes(order.status);
      } else if (filter === "cancelled") {
        matchesFilter = order.status === "cancelled";
      }

      return matchesSearch && matchesFilter;
    });
  }, [orders, search, filter]);

  const renderFilterButton = (type: FilterType, label: string) => {
    const isActive = filter === type;
    const btnStyle = isActive
      ? "bg-emerald-500 border-emerald-500"
      : "bg-card border-border";
    const textStyle = isActive ? "text-white" : "text-secondary";

    return (
      <Pressable
        onPress={() => setFilter(type)}
        style={tw(`px-4 py-2 rounded-xl border items-center justify-center mr-2 shadow-sm ${btnStyle}`)}
        accessibilityRole="button"
      >
        <Text style={tw(`text-xs font-inter-semibold ${textStyle}`)}>
          {label}
        </Text>
      </Pressable>
    );
  };

  const isDark = colors.background === "#020617";

  return (
    <View style={tw("flex-1 bg-background")}>
      <AppHeader title="My Orders" />
      
      {/* Search and Filters Section */}
      <View style={tw("px-5 pt-4 pb-2")}>
        {/* Search Input */}
        <View style={tw("flex flex-row items-center border border-border rounded-xl px-4 h-12 bg-card mb-4")}>
          <Feather name="search" size={18} color={colors.textSecondary} style={tw("mr-2")} />
          <TextInput
            placeholder="Search documents by name..."
            placeholderTextColor={isDark ? colors.textSecondary : "#94A3B8"}
            value={search}
            onChangeText={setSearch}
            style={tw("flex-1 text-sm font-inter text-primary h-full")}
          />
          {search ? (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>

        {/* Filter Pills */}
        <View style={tw("flex-row w-full justify-start py-1")}>
          {renderFilterButton("all", "All")}
          {renderFilterButton("active", "Active")}
          {renderFilterButton("completed", "Completed")}
          {renderFilterButton("cancelled", "Cancelled")}
        </View>
      </View>

      {/* Orders List */}
      {loading && !refreshing ? (
        <FlatList
          data={[1, 2, 3]}
          renderItem={() => <View style={tw("px-5")}><SkeletonCard /></View>}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={tw("pt-4")}
        />
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={tw("px-5 pt-4 pb-12 flex-grow")}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
          renderItem={({ item }) => (
            <OrderCard
              id={item._id}
              fileName={item.fileName}
              status={item.status}
              queuePosition={item.queuePosition}
              eta={item.eta}
              estimatedCost={item.estimatedCost}
              printerName={item.printerId?.name}
              printerLocation={item.printerId?.location}
              onPress={() => router.push(`/order-details/${item._id}`)}
            />
          )}
          ListEmptyComponent={
            <AppEmptyState
              icon="file-text"
              title="No Orders Found"
              description={
                search || filter !== "all"
                  ? "Try checking your search query or filters."
                  : "You haven't submitted any print jobs yet."
              }
              actionTitle={search || filter !== "all" ? undefined : "New Print Job"}
              onActionPress={() => router.push("/create-order")}
            />
          }
        />
      )}
    </View>
  );
}
