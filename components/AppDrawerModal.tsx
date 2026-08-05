import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { AppDrawer } from "./AppDrawer";

interface AppDrawerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AppDrawerModal: React.FC<AppDrawerModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.menuCard}>
          <AppDrawer onClose={onClose} />
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "flex-start",
  },
  menuCard: {
    width: "72%",
    height: "100%",
    backgroundColor: "#4b2e1f",
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  closeButtonText: {
    color: "#f4d9c6",
    fontWeight: "600",
  },
});
