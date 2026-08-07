import { useFocusEffect } from "@react-navigation/native";
import { Redirect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppDrawerModal } from "@/components/AppDrawerModal";
import { AppHeader } from "@/components/AppHeader";
import { PaginationControls } from "@/components/PaginationControls";
import { SearchBar } from "@/components/SearchBar";
import { useAuth } from "@/hooks/useAuth";
import { usePagination } from "@/hooks/usePagination";
import {
  blockUser,
  deleteUserAccount,
  getAllUsers,
  unblockUser,
} from "@/services/userService";
import type { UserProfile } from "@/types/user";

export default function UsersScreen() {
  const { user, role, isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [actionUid, setActionUid] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase().trim();
    return users.filter(
      (u) =>
        (u.displayName && u.displayName.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.uid && u.uid.toLowerCase().includes(q)),
    );
  }, [users, searchQuery]);

  const {
    page,
    totalPages,
    shouldPaginate,
    paginatedItems: paginatedUsers,
    goToNext,
    goToPrev,
  } = usePagination(filteredUsers);

  const fetchUsers = useCallback(async () => {
    if (!user || !isAdmin) return;

    try {
      setLoading(true);
      const fetchedUsers = await getAllUsers(role);
      setUsers(fetchedUsers);
    } catch {
      Alert.alert("Error", "Failed to fetch users.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, isAdmin, role]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [fetchUsers]),
  );

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (!isAdmin) {
    return <Redirect href="/home" />;
  }

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleBlockToggle = (target: UserProfile) => {
    const isBlocked = Boolean(target.isBlocked);
    const action = isBlocked ? "unblock" : "block";

    Alert.alert(
      isBlocked ? "Unblock User" : "Block User",
      isBlocked
        ? `Allow ${target.displayName || target.email} to sign in again?`
        : `Block ${target.displayName || target.email}? They will no longer be able to sign in.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isBlocked ? "Unblock" : "Block",
          style: isBlocked ? "default" : "destructive",
          onPress: async () => {
            try {
              setActionUid(target.uid);
              if (isBlocked) {
                await unblockUser(target.uid, role);
              } else {
                await blockUser(target.uid, role, user.uid);
              }
              setUsers((prev) =>
                prev.map((item) =>
                  item.uid === target.uid
                    ? { ...item, isBlocked: !isBlocked }
                    : item,
                ),
              );
              Alert.alert(
                "Success",
                `User has been ${action === "block" ? "blocked" : "unblocked"}.`,
              );
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error ? error.message : `Failed to ${action} user.`,
              );
            } finally {
              setActionUid(null);
            }
          },
        },
      ],
    );
  };

  const handleDeleteUser = (target: UserProfile) => {
    Alert.alert(
      "Delete Account",
      `Delete ${target.displayName || target.email}? This will block the account and remove it from the user list.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setActionUid(target.uid);
              await deleteUserAccount(target.uid, role, user.uid);
              setUsers((prev) => prev.filter((item) => item.uid !== target.uid));
              Alert.alert("Deleted", "User account has been deleted.");
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error ? error.message : "Failed to delete user.",
              );
            } finally {
              setActionUid(null);
            }
          },
        },
      ],
    );
  };

  const blockedCount = users.filter((item) => item.isBlocked).length;

  return (
    <View style={styles.container}>
      <AppHeader title="Manage Users" onMenuPress={() => setMenuVisible(true)} />

      <View style={styles.statsBanner}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{users.length}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: "#b45309" }]}>{blockedCount}</Text>
          <Text style={styles.statLabel}>Blocked</Text>
        </View>
      </View>

      {users.length > 0 ? (
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search users by name or email..."
        />
      ) : null}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4b2e1f" />
        </View>
      ) : users.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No users found.</Text>
        </View>
      ) : filteredUsers.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No users match your search.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#4b2e1f"
            />
          }
        >
          {paginatedUsers.map((item) => {
            const isBlocked = Boolean(item.isBlocked);
            const isBusy = actionUid === item.uid;

            return (
              <View key={item.uid} style={styles.userCard}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {item.displayName?.trim() || item.email}
                  </Text>
                  {item.displayName?.trim() ? (
                    <Text style={styles.userEmail}>{item.email}</Text>
                  ) : null}
                  <View style={styles.statusRow}>
                    <View
                      style={[
                        styles.statusBadge,
                        isBlocked ? styles.blockedBadge : styles.activeBadge,
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {isBlocked ? "Blocked" : "Active"}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.actions}>
                  <Pressable
                    style={[
                      styles.actionButton,
                      isBlocked ? styles.unblockButton : styles.blockButton,
                    ]}
                    onPress={() => handleBlockToggle(item)}
                    disabled={isBusy}
                  >
                    {isBusy ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.actionButtonText}>
                        {isBlocked ? "Unblock" : "Block"}
                      </Text>
                    )}
                  </Pressable>

                  <Pressable
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteUser(item)}
                    disabled={isBusy}
                  >
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}

          {shouldPaginate ? (
            <PaginationControls
              page={page}
              totalPages={totalPages}
              onPrev={goToPrev}
              onNext={goToNext}
            />
          ) : null}
        </ScrollView>
      )}

      <AppDrawerModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f7efe8",
  },
  statsBanner: {
    flexDirection: "row",
    backgroundColor: "#fffdf9",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e8dcd0",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statBox: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#4b2e1f",
  },
  statLabel: {
    fontSize: 12,
    color: "#7a5c45",
    fontWeight: "600",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#e8dcd0",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#7a5c45",
  },
  list: {
    paddingBottom: 24,
    gap: 12,
  },
  userCard: {
    backgroundColor: "#fffdf9",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e8dcd0",
  },
  userInfo: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#4b2e1f",
  },
  userEmail: {
    fontSize: 14,
    color: "#7a5c45",
    marginTop: 4,
  },
  statusRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: "#dcfce7",
  },
  blockedBadge: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4b2e1f",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
  },
  blockButton: {
    backgroundColor: "#b45309",
  },
  unblockButton: {
    backgroundColor: "#15803d",
  },
  deleteButton: {
    backgroundColor: "#b91c1c",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
