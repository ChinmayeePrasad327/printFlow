import { Redirect, useLocalSearchParams } from "expo-router";

export default function LegacyOrderDetails() {
  const { id } = useLocalSearchParams();
  return <Redirect href={`/order-details/${id}`} />;
}
