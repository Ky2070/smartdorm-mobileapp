import React, { useContext } from "react";
import { View, Text, Image, ScrollView, SafeAreaView } from "react-native";
import { Button, Divider } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { MyDispatchContext, MyUserContext } from "../../configs/MyContexts";

const Profile = () => {
  const user = useContext(MyUserContext);
  const dispatch = useContext(MyDispatchContext);
  const nav = useNavigation();

  const logout = () => {
    dispatch({ type: "logout" });
    nav.navigate("index");
  };

  const handleGoToRooms = () => {
    nav.navigate('Rooms');
  };

  console.log("Thông tin user:", user);

  const isAdmin = user?.role === "admin";
  const isStudent = user?.role === "student";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f0f4f7" }}>
      <ScrollView
        contentContainerStyle={{
          padding: 24,
          flexGrow: 1,
          justifyContent: "flex-start",
        }}
      >
        {/* Avatar & Greeting */}
        <View
          style={{
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Image
            source={
              user?.avatar
                ? { uri: user.avatar }
                : require("../../assets/favicon.png")
            }
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: "#ccc",
              marginBottom: 12,
            }}
          />
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: "#333",
            }}
          >
            Xin chào, {user?.first_name} {user?.last_name}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#666",
              marginTop: 4,
            }}
          >
            {user?.email}
          </Text>
        </View>

        <Divider style={{ marginBottom: 24 }} />

        {/* Thông tin cá nhân */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#444",
              marginBottom: 12,
            }}
          >
            Thông tin cá nhân
          </Text>

          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontWeight: "600", color: "#555" }}>Tên đầy đủ</Text>
            <Text style={{ color: "#333", fontSize: 16 }}>
              {user?.first_name} {user?.last_name}
            </Text>
          </View>

          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontWeight: "600", color: "#555" }}>Email</Text>
            <Text style={{ color: "#333", fontSize: 16 }}>{user?.email}</Text>
          </View>

          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontWeight: "600", color: "#555" }}>Giới tính</Text>
            <Text style={{ color: "#333", fontSize: 16 }}>{user?.gender === 'male' ? "Nam" : "Nữ"}</Text>
          </View>

          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontWeight: "600", color: "#555" }}>Vai trò</Text>
            <Text style={{ color: "#333", fontSize: 16 }}>
              {user?.role === "admin" ? "Quản trị viên" : "Sinh viên"}
            </Text>
          </View>
        </View>

        {/* Nút thao tác */}
        <Button
          mode="contained"
          style={{ marginBottom: 12, borderRadius: 24, paddingVertical: 6 }}
          contentStyle={{ height: 44 }}
          onPress={() => nav.navigate("UpdateProfile")}
        >
          Cập nhật hồ sơ
        </Button>
          {isStudent && (
            <Button
              mode="outlined"
              style={{ borderRadius: 24, paddingVertical: 6 }}
              contentStyle={{ height: 44 }}
              onPress={handleGoToRooms}
            >
            Phòng của tôi
          </Button>
          )}
        

        <Button
          mode="outlined"
          style={{ borderRadius: 20, marginTop: 24 }}
          onPress={logout}
          textColor="#d32f2f"
        >
          Đăng xuất
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
