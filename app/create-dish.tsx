import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { DishForm } from "@/components/DishForm";
import { useAuth } from "@/hooks/useAuth";
import { createDish } from "@/services/dishService";
import { getUserProfile } from "@/services/userService";
import type { DishInput } from "@/types/dish";

const initialValue: DishInput = {
  name: "",
  description: "",
  price: 0,
  imagePath: "",
  is_available: true,
};

export default function CreateDishScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [formValue, setFormValue] = useState<DishInput>(initialValue);
  const [submitting, setSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState(1);

  useEffect(() => {
    if (!user) {
      return;
    }

    getUserProfile(user.uid)
      .then((profile) => {
        const nextRole = Number(profile?.role ?? 1);
        setRole(nextRole);
        setIsAdmin(nextRole === 0);
      })
      .catch(() => {
        setRole(1);
        setIsAdmin(false);
      });
  }, [user]);

  const handleChange = (
    field: keyof DishInput,
    value: string | number | boolean,
  ) => {
    setFormValue((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Sign in required", "Please sign in first.");
      return;
    }

    if (!isAdmin) {
      Alert.alert("Permission denied", "Only admins can create dishes.");
      return;
    }

    if (!formValue.name.trim() || !formValue.description.trim()) {
      Alert.alert("Validation", "Name and description are required.");
      return;
    }

    setSubmitting(true);
    try {
      await createDish(
        {
          ...formValue,
          name: formValue.name.trim(),
          description: formValue.description.trim(),
          price: Number(formValue.price),
          imagePath: formValue.imagePath.trim(),
        },
        role,
      );
      router.replace("/home" as never);
    } catch (error) {
      Alert.alert("Error", "Unable to create dish.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Create Dish</Text>
      </View>
      <DishForm
        value={formValue}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Create Dish"
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
