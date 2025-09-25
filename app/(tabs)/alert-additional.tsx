import { Text, View } from "react-native";

export default function AlertAdditional() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>알림 추가</Text>
    </View>
  );
}

export const options = {
  title: "알림 추가",
};
