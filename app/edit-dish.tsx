import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { DishForm } from "@/components/DishForm";
import { useAuth } from "@/hooks/useAuth";
import { getDishes, updateDish } from "@/services/dishService";
import { getUserProfile } from "@/services/userService";
import type { DishInput } from "@/types/dish";

const initialValue: DishInput = {
  name: "",
  description: "",
  price: 0,
  imagePath: "",
  is_available: true,
};

export default function EditDishScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ dishId?: string }>();
  const { user } = useAuth();
  const [formValue, setFormValue] = useState<DishInput>(initialValue);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState(1);

  useEffect(() => {
    if (!user) {
      return;
    }

    const loadDish = async () => {
      try {
        const [profile, dishes] = await Promise.all([
          getUserProfile(user.uid),
          getDishes(),
        ]);
        const nextRole = Number(profile?.role ?? 1);
        setRole(nextRole);
        setIsAdmin(nextRole === 0);
        const dish = dishes.find((item) => item.id === params.dishId);
        if (!dish) {
          throw new Error("Dish not found");
        }
        setFormValue({
          name: dish.name,
          description: dish.description,
          price: dish.price,
          imagePath: dish.imagePath,
          is_available: dish.is_available,
        });
      } catch (error) {
        Alert.alert("Error", "Unable to load dish.");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadDish();
  }, [params.dishId, router, user]);

  const handleChange = (
    field: keyof DishInput,
    value: string | number | boolean,
  ) => {
    setFormValue((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user || !params.dishId) {
      Alert.alert("Sign in required", "Please sign in first.");
      return;
    }

    if (!isAdmin) {
      Alert.alert("Permission denied", "Only admins can edit dishes.");
      return;
    }

    if (!formValue.name.trim() || !formValue.description.trim()) {
      Alert.alert("Validation", "Name and description are required.");
      return;
    }

    setSubmitting(true);
    try {
      await updateDish(
        params.dishId,
        {
          name: formValue.name.trim(),
          description: formValue.description.trim(),
          price: Number(formValue.price),
          imagePath: formValue.imagePath.trim(),
          is_available: formValue.is_available,
        },
        role,
      );
      router.replace("/home" as never);
    } catch (error) {
      Alert.alert("Error", "Unable to update dish.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Edit Dish</Text>
      </View>
      <DishForm
        value={formValue}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Save Changes"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7efe8",
    padding: 16,
  },
  headerRow: {
    marginBottom: 8,
  },
  backText: {
    color: "#4b2e1f",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4b2e1f",
    marginBottom: 8,
  },
});
