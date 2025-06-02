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
            <Text style={{ fontWeight: "600", color: "#555" }}>Số điện thoại</Text>
            <Text style={{ color: "#333", fontSize: 16 }}>{user?.phone || "Chưa cập nhật"}</Text>
          </View>

          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontWeight: "600", color: "#555" }}>Vai trò</Text>
            <Text style={{ color: "#333", fontSize: 16 }}>
              {user?.role || "Sinh viên"}
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

        <Button
          mode="outlined"
          style={{ borderRadius: 24, paddingVertical: 6 }}
          contentStyle={{ height: 44 }}
          onPress={() => nav.navigate("Rooms")}
        >
          Phòng của tôi
        </Button>

        <Button
          mode="text"
          style={{ marginTop: 24 }}
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
