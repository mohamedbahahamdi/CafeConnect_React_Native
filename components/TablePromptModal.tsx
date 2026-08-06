import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface TablePromptModalProps {
  visible: boolean;
  onConfirm: (tableNumber: string) => void;
  onClose?: () => void;
  cancelable?: boolean;
  initialValue?: string;
}

export const TablePromptModal: React.FC<TablePromptModalProps> = ({
  visible,
  onConfirm,
  onClose,
  cancelable = false,
  initialValue = "",
}) => {
  const [input, setInput] = useState(initialValue);
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible) {
      setInput(initialValue);
      setError("");
    }
  }, [visible, initialValue]);

  const handleConfirm = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Please enter your table number (e.g. 05)");
      return;
    }
    setError("");
    onConfirm(trimmed);
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={() => {
        if (cancelable && onClose) onClose();
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.card}>
          <Text style={styles.icon}>🪑</Text>
          <Text style={styles.title}>Enter Table Number</Text>
          <Text style={styles.subtitle}>
            Please enter your table number to start ordering.
          </Text>

          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder=""
            placeholderTextColor="#a1a1aa"
            value={input}
            onChangeText={(val) => {
              setInput(val);
              if (error) setError("");
            }}
            keyboardType="number-pad"
            autoFocus
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.btnRow}>
            {cancelable && onClose ? (
              <TouchableOpacity
                style={[styles.btn, styles.cancelBtn]}
                onPress={onClose}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[styles.btn, styles.confirmBtn]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmBtnText}>Confirm Table</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#fffdf9",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#f1e5d8",
  },
  icon: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#4b2e1f",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#7a5c45",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 20,
  },
  input: {
    width: "100%",
    height: 52,
    backgroundColor: "#fefaf6",
    borderWidth: 1.5,
    borderColor: "#d4a373",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#4b2e1f",
    textAlign: "center",
    marginBottom: 8,
  },
  inputError: {
    borderColor: "#dc2626",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 12,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#f3f4f6",
  },
  cancelBtnText: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 15,
  },
  confirmBtn: {
    backgroundColor: "#4b2e1f",
  },
  confirmBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
});
