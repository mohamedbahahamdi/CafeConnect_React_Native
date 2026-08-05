import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { CustomButton } from "@/components/CustomButton";
import { DishCard } from "@/components/DishCard";
import type { Dish } from "@/types/dish";

interface DishListProps {
  dishes: Dish[];
  isAdmin: boolean;
  onCreate?: () => void;
  onEdit: (dish: Dish) => void;
  onDelete: (dish: Dish) => void;
  onToggleAvailability: (dish: Dish) => void;
  onAddToCart?: (dish: Dish) => void;
  title?: string;
  emptyMessage?: string;
}

export const DishList = ({
  dishes,
  isAdmin,
  onCreate,
  onEdit,
  onDelete,
  onToggleAvailability,
  onAddToCart,
  title = "Dishes",
  emptyMessage = "No dishes created yet.",
}: DishListProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        {isAdmin && onCreate ? (
          <CustomButton title="Add Menu Items" onPress={onCreate} />
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {dishes.length === 0 ? (
          <Text style={styles.empty}>{emptyMessage}</Text>
        ) : (
          dishes.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              isAdmin={isAdmin}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleAvailability={onToggleAvailability}
              onAddToCart={onAddToCart}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    marginBottom: 12,
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  list: {
    paddingBottom: 24,
  },
  empty: {
    textAlign: "center",
    color: "#64748b",
    marginTop: 24,
  },
});
