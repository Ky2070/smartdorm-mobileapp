import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  SafeAreaView,
} from "react-native";
import { Icon } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ⚠️ Mock danh sách người dùng
const USERS = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    role: "Sinh viên",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: "2",
    name: "Trần Thị B",
    role: "Admin",
    avatar: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: "3",
    name: "Lê Văn C",
    role: "Sinh viên",
    avatar: "https://i.pravatar.cc/150?img=3",
  },
];

const UserItem = ({ user, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 120,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay: index * 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY }],
        marginBottom: 16,
      }}
    >
      <View style={styles.card}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.role}>{user.role}</Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Icon source="pencil" size={22} color="#2980b9" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Icon source="delete" size={22} color="#c0392b" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const UserManagementScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 30,
          },
        ]}
      >
        <Text style={styles.title}>Quản lý người dùng</Text>

        <FlatList
          data={USERS}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <UserItem user={item} index={index} />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f6fc",
  },
  container: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#2e86de",
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
  },
  role: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  iconButton: {
    marginLeft: 10,
  },
});

export default UserManagementScreen;
