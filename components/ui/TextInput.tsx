import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { Typography } from "./Typography";

type AuthTextInputProps = TextInputProps & {
  label?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  isPassword?: boolean;
};

export function AuthTextInput({
  label,
  icon,
  isPassword,
  style,
  ...props
}: AuthTextInputProps) {
  const [secure, setSecure] = useState(isPassword);

  return (
    <View style={styles.container}>
      {(label || icon) && (
        <View style={styles.labelRow}>
          {icon && (
            <MaterialIcons
              name={icon}
              size={14}
              color="#555"
              style={styles.labelIcon}
            />
          )}
          {label && (
            <Typography size={12} weight="500" style={styles.label}>
              {label}
            </Typography>
          )}
        </View>
      )}

      <View style={styles.inputWrapper}>
        <TextInput
          {...props}
          style={[styles.input, style]}
          placeholderTextColor="#aaa"
          secureTextEntry={secure}
        />
        {isPassword && (
          <Pressable
            onPress={() => setSecure(!secure)}
            style={styles.eyeButton}
          >
            <MaterialIcons
              name={secure ? "visibility-off" : "visibility"}
              size={20}
              color="#555"
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%" },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  labelIcon: { marginRight: 4 },
  label: { color: "#333333" },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    borderWidth: 0.5,
    borderColor: "#33333366",
    borderRadius: 10,
    padding: 15,
    fontFamily: "Pretendard",
    fontSize: 16,
    paddingRight: 40,
  },
  eyeButton: {
    position: "absolute",
    right: 12,
  },
});
