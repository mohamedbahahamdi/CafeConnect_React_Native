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
          <Pressable
            style={styles.closeButton}
            onPress={onClose}
            accessibilityLabel="Close menu"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
          <AppDrawer onClose={onClose} />
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
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
    padding: 8,
  },
  closeButtonText: {
    color: "#ef4444",
    fontSize: 22,
    fontWeight: "800",
  },
});
