import { Text, View } from "react-native";

export default function Chart() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>자동 매매</Text>
    </View>
  );
}

export const options = {
  title: "자동 매매",
};
