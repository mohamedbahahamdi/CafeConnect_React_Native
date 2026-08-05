import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onMenuPress: () => void;
}

export const AppHeader = ({ title, subtitle, onMenuPress }: AppHeaderProps) => {
  return (
    <View style={styles.header}>
      <Pressable style={styles.hamburgerTouch} onPress={onMenuPress} accessibilityLabel="Open menu">
        <Text style={styles.hamburger}>☰</Text>
      </Pressable>
      <View style={styles.headerTextWrap}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  hamburgerTouch: {
    paddingTop: 10,
    paddingBottom: 4,
    paddingRight: 6,
    marginTop: 4,
  },
  hamburger: {
    fontSize: 26,
    color: "#4b2e1f",
    fontWeight: "700",
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#4b2e1f",
  },
  subtitle: {
    fontSize: 14,
    color: "#7a5c45",
    marginTop: 2,
  },
});
