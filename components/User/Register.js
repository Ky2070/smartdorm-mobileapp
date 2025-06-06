import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from "react-native";
import { TextInput, Button, HelperText } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { authApis, endpoints } from "../../configs/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Register = () => {
  const info = [
    { label: "Tên", field: "first_name", icon: "account" },
    { label: "Họ và tên lót", field: "last_name", icon: "account" },
    { label: "Tên đăng nhập", field: "username", icon: "account" },
    { label: "Mật khẩu", field: "password", icon: "lock", secureTextEntry: true },
    { label: "Xác nhận mật khẩu", field: "confirm", icon: "lock", secureTextEntry: true },
    { label: "Số điện thoại", field: "phone", icon: "phone" },
    { label: "Email", field: "email", icon: "email" },
  ];

  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const nav = useNavigation();

  const setState = (value, field) => {
    setUser({ ...user, [field]: value });
  };

  const picker = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Bạn cần cấp quyền truy cập ảnh!");
    } else {
      const result = await ImagePicker.launchImageLibraryAsync();
      if (!result.canceled) setState(result.assets[0], "avatar");
    }
  };

  const validate = () => {
    if (Object.values(user).length === 0) {
      setMsg("Vui lòng nhập thông tin!");
      return false;
    }

    for (let i of info) {
      if (!user[i.field] || user[i.field].trim() === "") {
        setMsg(`Vui lòng nhập ${i.label}!`);
        return false;
      }
    }

    if (user.password !== user.confirm) {
      setMsg("Mật khẩu không khớp!");
      return false;
    }

    setMsg("");
    return true;
  };

  const createAccount = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");
      if (!token) {
      setMsg("Không thể xác thực. Vui lòng đăng nhập lại!");
      return;
      }
      console.log("Token:", token); // DEBUG
      const getMimeType = (name) => {
        if (!name) return 'image/jpeg';
        const ext = name.split('.').pop().toLowerCase();
        switch (ext) {
          case 'jpg':
          case 'jpeg':
            return 'image/jpeg';
          case 'png':
            return 'image/png';
          case 'gif':
            return 'image/gif';
          default:
            return 'image/jpeg';
        }
      };
      let form = new FormData();

      for (let key in user) {
        if (key !== "confirm") {
          if (key === "avatar") {
            form.append("avatar", {
              uri: user.avatar.uri,
              name: user.avatar.fileName || "avatar.jpg",
              type: getMimeType(user.avatar.fileName),
            });
          } else {
            form.append(key, user[key]);
          }
        }
      }
      
      const res = await authApis(token).post(endpoints["register"], form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      console.log("Avatar gửi lên:", user.avatar);
      if (res.status === 201) {
        Alert.alert("Thành công", "Tạo tài khoản sinh viên thành công!");
        nav.goBack(); // Hoặc điều hướng đến danh sách sinh viên
      }
    } catch (ex) {
      console.error("🧨 Axios Error:", ex.message);
      if (ex.response) {
        console.error("👉 Server responded:", ex.response.data);
      } else if (ex.request) {
        console.error("👉 No response received. Request was:", ex.request);
      } else {
        console.error("👉 Error setting up request:", ex.message);
      }
      setMsg("Tạo tài khoản thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f9fc" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : null}
      >
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#2a2a2a",
              marginBottom: 20,
              marginTop: 10,
              textAlign: "center",
            }}
          >
            Tạo tài khoản sinh viên
          </Text>

          {msg ? (
            <HelperText type="error" visible={!!msg} style={{ marginBottom: 10 }}>
              {msg}
            </HelperText>
          ) : null}

          {info.map(({ label, field, icon, secureTextEntry }) => (
            <TextInput
              key={field}
              label={label}
              mode="outlined"
              right={<TextInput.Icon name={icon} />}
              secureTextEntry={secureTextEntry}
              value={user[field] || ""}
              onChangeText={(text) => setState(text, field)}
              style={{ marginBottom: 15 }}
              autoCapitalize="none"
              keyboardType={
                field === "email"
                  ? "email-address"
                  : field === "phone"
                  ? "phone-pad"
                  : "default"
              }
            />
          ))}

          <TouchableOpacity
            onPress={picker}
            style={{
              marginBottom: 15,
              paddingVertical: 12,
              alignItems: "center",
              backgroundColor: "#e1e7f0",
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#3b5998", fontWeight: "600" }}>
              {user.avatar ? "Thay đổi ảnh đại diện" : "Chọn ảnh đại diện"}
            </Text>
          </TouchableOpacity>

          {user.avatar && (
            <View style={{ alignItems: "center", marginBottom: 25 }}>
              <Image
                source={{ uri: user.avatar.uri }}
                style={{ width: 120, height: 120, borderRadius: 60 }}
              />
            </View>
          )}

          <Button
            mode="contained"
            onPress={createAccount}
            loading={loading}
            disabled={loading}
            contentStyle={{ paddingVertical: 10 }}
            style={{ marginBottom: 15, borderRadius: 25 }}
            uppercase={false}
          >
            Tạo tài khoản
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Register;
