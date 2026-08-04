import { Link, Redirect } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { CustomButton } from "@/components/CustomButton";
import { CustomInput } from "@/components/CustomInput";
import { useAuth } from "@/hooks/useAuth";
import { getAuthErrorMessage } from "@/services/authService";

export default function LoginScreen() {
  const { user, signIn, loading, authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setError("");
      await signIn(email.trim(), password);
    } catch (err) {
      const message = getAuthErrorMessage(err);
      setError(message);
      Alert.alert("Login failed", message);
    }
  };

  if (user) {
    return <Redirect href="/home" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <CustomInput value={email} placeholder="Email" onChangeText={setEmail} />
      <CustomInput
        value={password}
        placeholder="Password"
        onChangeText={setPassword}
        secureTextEntry
      />

      {error || authError ? (
        <Text style={styles.error}>{error || authError}</Text>
      ) : null}

      <CustomButton title="Login" onPress={handleLogin} loading={loading} />

      <Link href="/signup" style={styles.link}>
        Create an account
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
