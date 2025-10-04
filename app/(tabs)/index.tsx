import { Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>홈 화면</Text>
    </View>
  );
}

export const options = {
  title: "홈 화면",
};
