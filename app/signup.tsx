import { Link, Redirect } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { CustomButton } from "@/components/CustomButton";
import { CustomInput } from "@/components/CustomInput";
import { useAuth } from "@/hooks/useAuth";
import { getAuthErrorMessage } from "@/services/authService";

export default function SignupScreen() {
  const { user, signUp, loading, profileReady, authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setError("");
      await signUp(email.trim(), password);
    } catch (err) {
      const message = getAuthErrorMessage(err);
      setError(message);
      Alert.alert("Signup failed", message);
    }
  };

  if (user && profileReady) {
    return <Redirect href="/home" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Join Coffee Connect</Text>

      <CustomInput value={email} placeholder="Email" onChangeText={setEmail} />
      <CustomInput
        value={password}
        placeholder="Password"
        onChangeText={setPassword}
        secureTextEntry
      />
      <CustomInput
        value={confirmPassword}
        placeholder="Confirm password"
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {error || authError ? (
        <Text style={styles.error}>{error || authError}</Text>
      ) : null}

      <CustomButton
        title="Create account"
        onPress={handleSignup}
        loading={loading}
      />

      <Link href="/login" style={styles.link}>
        Already have an account?
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 20,
  },
  error: {
    color: "#dc2626",
    marginBottom: 8,
  },
  link: {
    marginTop: 16,
    color: "#4b2e1f",
    textAlign: "center",
  },
});
