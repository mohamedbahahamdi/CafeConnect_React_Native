import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { CustomButton } from "@/components/CustomButton";
import { DishCard } from "@/components/DishCard";
import { PaginationControls } from "@/components/PaginationControls";
import { SearchBar } from "@/components/SearchBar";
import { usePagination } from "@/hooks/usePagination";
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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDishes = useMemo(() => {
    if (!searchQuery.trim()) return dishes;
    const q = searchQuery.toLowerCase().trim();
    return dishes.filter(
      (dish) =>
        dish.name.toLowerCase().includes(q) ||
        (dish.description && dish.description.toLowerCase().includes(q)),
    );
  }, [dishes, searchQuery]);

  const { page, totalPages, shouldPaginate, paginatedItems, goToNext, goToPrev } =
    usePagination(filteredDishes);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        {isAdmin && onCreate ? (
          <CustomButton title="Add Menu Items" onPress={onCreate} />
        ) : null}
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search menu items..."
      />

      <ScrollView contentContainerStyle={styles.list}>
        {dishes.length === 0 ? (
          <Text style={styles.empty}>{emptyMessage}</Text>
        ) : filteredDishes.length === 0 ? (
          <Text style={styles.empty}>No dishes match your search.</Text>
        ) : (
          paginatedItems.map((dish) => (
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

        {shouldPaginate ? (
          <PaginationControls
            page={page}
            totalPages={totalPages}
            onPrev={goToPrev}
            onNext={goToNext}
          />
        ) : null}
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
