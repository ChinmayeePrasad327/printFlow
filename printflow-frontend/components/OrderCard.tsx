import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { AppCard } from "./AppCard";
import { StatusBadge, OrderStatus } from "./StatusBadge";

export interface OrderCardProps {
  id: string;
  fileName: string;
  status: OrderStatus;
  queuePosition: number;
  eta: number;
  estimatedCost: number;
  printerName?: string;
  printerLocation?: string;
  onPress: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  id,
  fileName,
  status,
  queuePosition,
  eta,
  estimatedCost,
  printerName,
  printerLocation,
  onPress,
}) => {
  const { tw, colors } = useTheme();

  return (
    <AppCard onPress={onPress} style={tw("mb-4")}>
      <View style={tw("flex flex-row items-start justify-between mb-3")}>
        <View style={tw("flex-1 mr-3")}>
          <View style={tw("flex flex-row items-center gap-2 mb-1")}>
            <Feather name="file-text" size={18} color={colors.accent} />
            <Text style={tw("text-base font-inter-semibold text-primary font-bold")} numberOfLines={1}>
              {fileName}
            </Text>
          </View>
          {printerName && (
            <Text style={tw("text-xs font-inter text-secondary")}>
              {printerName} • {printerLocation || "Campus"}
            </Text>
          )}
        </View>

        <StatusBadge status={status} />
      </View>

      <View style={tw("flex flex-row items-center justify-between pt-3 border-t border-border")}>
        <View style={tw("flex-row gap-4")}>
          <View style={tw("flex flex-col")}>
            <Text style={tw("text-[10px] font-inter text-secondary uppercase tracking-wider")}>
              Queue
            </Text>
            <Text style={tw("text-sm font-space-bold text-primary mt-0.5")}>
              {status === "ready" || status === "collected" || status === "cancelled" ? "-" : `#${queuePosition}`}
            </Text>
          </View>

          <View style={tw("flex flex-col")}>
            <Text style={tw("text-[10px] font-inter text-secondary uppercase tracking-wider")}>
              ETA
            </Text>
            <Text style={tw("text-sm font-space-bold text-primary mt-0.5")}>
              {status === "ready" || status === "collected" || status === "cancelled" ? "-" : `${eta} mins`}
            </Text>
          </View>
        </View>

        <View style={tw("flex flex-col items-end")}>
          <Text style={tw("text-[10px] font-inter text-secondary uppercase tracking-wider")}>
            Cost
          </Text>
          <Text style={tw("text-base font-space-bold text-emerald-500 font-bold mt-0.5")}>
            ₹{estimatedCost.toFixed(2)}
          </Text>
        </View>
      </View>
    </AppCard>
  );
};
