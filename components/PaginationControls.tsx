import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export const PaginationControls = ({
  page,
  totalPages,
  onPrev,
  onNext,
}: PaginationControlsProps) => {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.button, page === 1 && styles.buttonDisabled]}
        onPress={onPrev}
        disabled={page === 1}
      >
        <Text style={[styles.buttonText, page === 1 && styles.buttonTextDisabled]}>
          Previous
        </Text>
      </Pressable>

      <Text style={styles.pageInfo}>
        Page {page} of {totalPages}
      </Text>

      <Pressable
        style={[styles.button, page === totalPages && styles.buttonDisabled]}
        onPress={onNext}
        disabled={page === totalPages}
      >
        <Text
          style={[
            styles.buttonText,
            page === totalPages && styles.buttonTextDisabled,
          ]}
        >
          Next
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e8dcd0",
  },
  button: {
    backgroundColor: "#4b2e1f",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: "#e8dcd0",
  },
  buttonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  buttonTextDisabled: {
    color: "#9ca3af",
  },
  pageInfo: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b2e1f",
  },
});
