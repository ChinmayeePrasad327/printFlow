import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, RefreshControl, TextInput, Alert, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useTheme } from "../../context/ThemeContext";
import { useAppAuth } from "../../context/AuthContext";
import { AppHeader } from "../../components/AppHeader";
import { AppCard } from "../../components/AppCard";
import { AppButton } from "../../components/AppButton";
import { AppModal } from "../../components/AppModal";
import { StatusBadge, OrderStatus } from "../../components/StatusBadge";
import { AppLoader } from "../../components/AppLoader";
import { getOrderById, cancelOrder, requestPriority } from "../../services/orderService";
import { trackEvent } from "../../utils/posthog";

export default function OrderDetails() {
  const { id } = useLocalSearchParams();
  const { tw, colors } = useTheme();
  const { dbUser } = useAppAuth();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Priority modal states
  const [priorityModalVisible, setPriorityModalVisible] = useState(false);
  const [priorityReason, setPriorityReason] = useState("");
  const [priorityLoading, setPriorityLoading] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      const response = await getOrderById(id as string);
      if (response && response.success && response.data) {
        setOrder(response.data);
      } else {
        loadMockDetails();
      }
    } catch (e) {
      console.warn("Failed to fetch order details, loading mock details (Demo Mode)", e);
      loadMockDetails();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMockDetails = () => {
    // Determine mock based on id
    setOrder({
      _id: id || "order_1",
      fileName: "CS_301_MachineLearning_Assignment.pdf",
      status: "pending",
      totalPages: 12,
      copies: 2,
      priorityLevel: "normal",
      priorityRequested: false,
      priorityApproved: false,
      priorityReason: "",
      confidential: true,
      queuePosition: 2,
      eta: 8,
      estimatedCost: 15.0,
      printerId: {
        name: "Library Printer A",
        location: "Library Floor 1",
        printerType: "bw",
        status: "online",
        pagesPerMinute: 15,
      },
      createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    });
  };

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrderDetails();
  };

  // Handle Cancel Order
  const handleCancel = async () => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this print order?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setCancelLoading(true);
            try {
              const response = await cancelOrder(id as string);
              if (response && response.success) {
                trackEvent("order_cancelled", { id });
                Alert.alert("Success", "Your order has been cancelled.");
                fetchOrderDetails();
              } else {
                Alert.alert("Error", "Failed to cancel order.");
              }
            } catch (e: any) {
              console.error(e);
              Alert.alert("Error", e.response?.data?.message || "Failed to cancel order.");
            } finally {
              setCancelLoading(false);
            }
          },
        },
      ]
    );
  };

  // Handle Request Priority
  const handlePrioritySubmit = async () => {
    if (!priorityReason.trim()) {
      Alert.alert("Error", "Please enter a reason for priority access.");
      return;
    }

    setPriorityLoading(true);
    try {
      const response = await requestPriority(id as string, priorityReason.trim());
      if (response && response.success) {
        trackEvent("priority_requested", { id, reason: priorityReason });
        Alert.alert("Success", "Priority request submitted to operator for approval.");
        setPriorityModalVisible(false);
        setPriorityReason("");
        fetchOrderDetails();
      } else {
        Alert.alert("Error", "Failed to submit priority request.");
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert("Error", e.response?.data?.message || "Failed to submit priority request.");
    } finally {
      setPriorityLoading(false);
    }
  };

  // Get active step index for progress timeline
  // Stepper: Pending (0) -> Accepted (1) -> Printing (2) -> Ready (3)
  const getStepIndex = (status: OrderStatus) => {
    if (status === "pending") return 0;
    if (status === "accepted") return 1;
    if (status === "printing") return 2;
    if (status === "ready" || status === "collected") return 3;
    return -1; // cancelled
  };

  if (loading) {
    return <AppLoader />;
  }

  if (!order) {
    return (
      <View style={tw("flex-1 justify-center items-center bg-background p-5")}>
        <Text style={tw("text-sm font-inter text-secondary")}>Order details not found.</Text>
      </View>
    );
  }

  const stepIndex = getStepIndex(order.status);
  const showCancel = ["pending", "accepted"].includes(order.status);
  const showPriorityBtn = !order.priorityRequested && ["pending", "accepted"].includes(order.status);

  return (
    <View style={tw("flex-1 bg-background")}>
      <AppHeader title="Order Tracking" showBack />

      <ScrollView
        contentContainerStyle={tw("p-5 pb-16")}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
      >
        {/* Priority Status Alert Banner */}
        {order.priorityRequested && (
          <View
            style={tw(
              `flex flex-row items-center border rounded-2xl p-4 mb-5 gap-3 ${
                order.priorityApproved
                  ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/20"
                  : "bg-amber-50 dark:bg-amber-950/20 border-amber-500/20"
              }`
            )}
          >
            <Feather
              name={order.priorityApproved ? "award" : "clock"}
              size={20}
              color={order.priorityApproved ? colors.accent : colors.warning}
            />
            <View style={tw("flex-1")}>
              <Text
                style={tw(
                  `text-sm font-inter-semibold font-bold ${
                    order.priorityApproved ? "text-emerald-500" : "text-amber-600 dark:text-amber-500"
                  }`
                )}
              >
                {order.priorityApproved ? "Priority Access Approved" : "Priority Request Pending"}
              </Text>
              <Text style={tw("text-xs font-inter text-secondary mt-0.5")}>
                {order.priorityApproved
                  ? "Your job has been moved to the top of the queue."
                  : `Waiting for operator review. Reason: "${order.priorityReason}"`}
              </Text>
            </View>
          </View>
        )}

        {/* Stepper Tracking Progress */}
        {order.status !== "cancelled" && (
          <AppCard style={tw("mb-5 bg-card")}>
            <Text style={tw("text-xs font-inter-semibold text-secondary uppercase tracking-wider mb-5")}>
              Order Lifecycle Status
            </Text>

            <View style={tw("flex flex-row justify-between relative w-full items-start px-2")}>
              {/* Connector line */}
              <View style={tw("absolute left-4 right-4 top-3.5 h-[2px] bg-slate-200 dark:bg-slate-800 -z-10")} />
              {/* Highlight connector line */}
              {stepIndex > 0 && (
                <View
                  style={[
                    tw("absolute left-4 top-3.5 h-[2px] bg-emerald-500 -z-10"),
                    { width: `${(stepIndex / 3) * 92}%` },
                  ]}
                />
              )}

              {/* Step 1: Pending */}
              <View style={tw("items-center flex-1")}>
                <View style={tw(`h-8 w-8 rounded-full items-center justify-center border ${stepIndex >= 0 ? "bg-emerald-500 border-emerald-500" : "bg-card border-border"}`)}>
                  <Feather name="clock" size={14} color={stepIndex >= 0 ? "#FFFFFF" : colors.textSecondary} />
                </View>
                <Text style={tw(`text-[10px] font-inter-semibold mt-2 text-center ${stepIndex >= 0 ? "text-primary font-bold" : "text-secondary"}`)}>
                  Pending
                </Text>
              </View>

              {/* Step 2: Accepted */}
              <View style={tw("items-center flex-1")}>
                <View style={tw(`h-8 w-8 rounded-full items-center justify-center border ${stepIndex >= 1 ? "bg-emerald-500 border-emerald-500" : "bg-card border-border"}`)}>
                  <Feather name="thumbs-up" size={14} color={stepIndex >= 1 ? "#FFFFFF" : colors.textSecondary} />
                </View>
                <Text style={tw(`text-[10px] font-inter-semibold mt-2 text-center ${stepIndex >= 1 ? "text-primary font-bold" : "text-secondary"}`)}>
                  Accepted
                </Text>
              </View>

              {/* Step 3: Printing */}
              <View style={tw("items-center flex-1")}>
                <View style={tw(`h-8 w-8 rounded-full items-center justify-center border ${stepIndex >= 2 ? "bg-emerald-500 border-emerald-500" : "bg-card border-border"}`)}>
                  <Feather name="printer" size={14} color={stepIndex >= 2 ? "#FFFFFF" : colors.textSecondary} />
                </View>
                <Text style={tw(`text-[10px] font-inter-semibold mt-2 text-center ${stepIndex >= 2 ? "text-primary font-bold" : "text-secondary"}`)}>
                  Printing
                </Text>
              </View>

              {/* Step 4: Ready */}
              <View style={tw("items-center flex-1")}>
                <View style={tw(`h-8 w-8 rounded-full items-center justify-center border ${stepIndex >= 3 ? "bg-emerald-500 border-emerald-500" : "bg-card border-border"}`)}>
                  <Feather name="check" size={14} color={stepIndex >= 3 ? "#FFFFFF" : colors.textSecondary} />
                </View>
                <Text style={tw(`text-[10px] font-inter-semibold mt-2 text-center ${stepIndex >= 3 ? "text-primary font-bold" : "text-secondary"}`)}>
                  Ready
                </Text>
              </View>
            </View>
          </AppCard>
        )}

        {/* Order Details Card */}
        <AppCard style={tw("mb-5 bg-card")}>
          <View style={tw("flex flex-row items-center justify-between pb-4 border-b border-border mb-4")}>
            <View style={tw("flex-1 mr-3")}>
              <Text style={tw("text-lg font-space-bold text-primary font-bold")}>{order.fileName}</Text>
              <Text style={tw("text-xs font-inter text-secondary mt-0.5")}>
                Submitted {new Date(order.createdAt).toLocaleTimeString()}
              </Text>
            </View>
            <StatusBadge status={order.status} />
          </View>

          <View style={tw("gap-3")}>
            <View style={tw("flex flex-row justify-between")}>
              <Text style={tw("text-sm font-inter text-secondary")}>Pages per copy</Text>
              <Text style={tw("text-sm font-inter text-primary")}>{order.totalPages} pages</Text>
            </View>
            <View style={tw("flex flex-row justify-between")}>
              <Text style={tw("text-sm font-inter text-secondary")}>Number of copies</Text>
              <Text style={tw("text-sm font-inter text-primary")}>{order.copies} copies</Text>
            </View>
            <View style={tw("flex flex-row justify-between")}>
              <Text style={tw("text-sm font-inter text-secondary")}>Confidential</Text>
              <Text style={tw("text-sm font-inter text-primary")}>
                {order.confidential ? "Yes (Requires OTP)" : "No"}
              </Text>
            </View>
            <View style={tw("flex flex-row justify-between pt-3 border-t border-border")}>
              <Text style={tw("text-sm font-inter text-secondary")}>Queue Position</Text>
              <Text style={tw("text-base font-space-bold text-primary font-bold")}>
                {order.status === "cancelled" || stepIndex >= 3 ? "-" : `#${order.queuePosition}`}
              </Text>
            </View>
            <View style={tw("flex flex-row justify-between")}>
              <Text style={tw("text-sm font-inter text-secondary")}>Estimated wait time</Text>
              <Text style={tw("text-base font-space-bold text-primary font-bold")}>
                {order.status === "cancelled" || stepIndex >= 3 ? "-" : `${order.eta} mins`}
              </Text>
            </View>
            <View style={tw("flex flex-row justify-between pt-3 border-t border-border")}>
              <Text style={tw("text-base font-inter-bold text-primary font-bold")}>Estimated Cost</Text>
              <Text style={tw("text-xl font-space-bold text-emerald-500 font-bold")}>
                ₹{order.estimatedCost?.toFixed(2) || "0.00"}
              </Text>
            </View>
          </View>
        </AppCard>

        {/* Printer Info Card */}
        {order.printerId && (
          <AppCard style={tw("mb-6 bg-card")}>
            <Text style={tw("text-xs font-inter-semibold text-secondary uppercase tracking-wider mb-3")}>
              Destination Printer
            </Text>
            <View style={tw("flex flex-row items-start gap-3")}>
              <View style={tw("h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 items-center justify-center")}>
                <Feather name="printer" size={20} color={colors.accent} />
              </View>
              <View style={tw("flex-1")}>
                <Text style={tw("text-base font-inter-bold text-primary font-bold")}>
                  {order.printerId.name}
                </Text>
                <Text style={tw("text-xs font-inter text-secondary mt-0.5")}>
                  Location: {order.printerId.location}
                </Text>
              </View>
            </View>
          </AppCard>
        )}

        {/* Actions Section */}
        {showPriorityBtn && (
          <AppButton
            title="Request Priority Queue"
            onPress={() => setPriorityModalVisible(true)}
            variant="secondary"
            style={tw("mb-3 w-full")}
          />
        )}

        {showCancel && (
          <AppButton
            title="Cancel Order"
            onPress={handleCancel}
            loading={cancelLoading}
            variant="danger"
            style={tw("w-full")}
          />
        )}
      </ScrollView>

      {/* Priority Request modal dialog */}
      <AppModal visible={priorityModalVisible} onClose={() => setPriorityModalVisible(false)}>
        <View style={tw("items-center mb-4")}>
          <Feather name="award" size={28} color={colors.accent} style={tw("mb-2")} />
          <Text style={tw("text-lg font-space-bold text-primary text-center")}>
            Request Priority Access
          </Text>
          <Text style={tw("text-xs font-inter text-secondary text-center px-4 mt-1")}>
            Operators review and approve priority requests based on emergency requirements.
          </Text>
        </View>

        <View style={tw("my-4")}>
          <Text style={tw("text-xs font-inter-semibold text-secondary mb-2")}>
            Reason for priority
          </Text>
          <TextInput
            value={priorityReason}
            onChangeText={setPriorityReason}
            placeholder="e.g. Need prints urgently for job interview in 10 mins"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            style={[
              tw("border border-border rounded-xl p-3 text-sm font-inter text-primary bg-background h-24"),
              { textAlignVertical: "top" },
            ]}
          />
        </View>

        <AppButton
          title="Submit Request"
          onPress={handlePrioritySubmit}
          loading={priorityLoading}
          variant="primary"
          style={tw("w-full mt-2")}
        />
      </AppModal>
    </View>
  );
}
