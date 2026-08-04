import React from "react";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";

import { CustomButton } from "@/components/CustomButton";
import type { DishInput } from "@/types/dish";

interface DishFormProps {
  value: DishInput;
  onChange: (field: keyof DishInput, value: string | number | boolean) => void;
  onSubmit: () => void;
  submitting: boolean;
  submitLabel: string;
}

export const DishForm = ({
  value,
  onChange,
  onSubmit,
  submitting,
  submitLabel,
}: DishFormProps) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Dish name"
        value={value.name}
        onChangeText={(text) => onChange("name", text)}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        value={value.description}
        multiline
        onChangeText={(text) => onChange("description", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Price"
        keyboardType="decimal-pad"
        value={value.price.toString()}
        onChangeText={(text) =>
          onChange("price", text === "" ? 0 : Number(text))
        }
      />
      <TextInput
        style={styles.input}
        placeholder="Image path"
        value={value.imagePath}
        onChangeText={(text) => onChange("imagePath", text)}
      />
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Available</Text>
        <Switch
          value={value.is_available}
          onValueChange={(checked) => onChange("is_available", checked)}
        />
      </View>
      <CustomButton
        title={submitLabel}
        onPress={onSubmit}
        loading={submitting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#c7a98b",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
});
