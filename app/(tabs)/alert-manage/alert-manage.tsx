import { Text, View } from "react-native";

export default function AlertManage() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>알림 히스토리</Text>
    </View>
  );
}

export const options = {
  title: "알림 히스토리",
};
