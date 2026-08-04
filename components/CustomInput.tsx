import React from "react";
import { StyleSheet, TextInput, type TextInputProps } from "react-native";

interface CustomInputProps extends TextInputProps {
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
}

export const CustomInput = ({
  value,
  placeholder,
  onChangeText,
  secureTextEntry = false,
  ...rest
}: CustomInputProps) => {
  return (
    <TextInput
      value={value}
      placeholder={placeholder}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      autoCapitalize="none"
      autoCorrect={false}
      style={styles.input}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
});
