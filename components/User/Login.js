import React, { useContext, useState } from "react";
import { 
  Image, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  View, 
  KeyboardAvoidingView, 
  Platform, 
  SafeAreaView 
} from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";

import MyStyles from "../../styles/MyStyles";
import { useNavigation } from "@react-navigation/native";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyDispatchContext } from "../../configs/MyContexts";

const Login = () => {
  const info = [
    {
      label: "Tên đăng nhập",
      field: "username",
      icon: "account",
      secureTextEntry: false,
    },
    {
      label: "Mật khẩu",
      field: "password",
      icon: "eye",
      secureTextEntry: true,
    },
  ];

  const [user, setUser] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const nav = useNavigation();
  const dispatch = useContext(MyDispatchContext);

  const setState = (value, field) => {
    setUser({ ...user, [field]: value });
  };

  const validate = () => {
    if (Object.values(user).some((v) => !v || v.trim() === "")) {
      setMsg("Vui lòng nhập đầy đủ thông tin!");
      return false;
    }
    setMsg("");
    return true;
  };

  const login = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      let res = await Apis.post(endpoints["login"], {
        ...user,
        client_id: "8qOcCr3K5mgqgpPJWklFsrnbxR1TZ9MC0zAKXOoN",
        client_secret:
          "NFNTDKSw5A5i76ADvzrbY3M37xsM4j8VEd61AdwRtggAX92zM9QKR66xyTQPfYzBjV0oKU67GRMeLz11eAkTbyI2QbdTIseHRYrAiEzfKe8y9kKTeLeXLw7zi0ylGixA",
        grant_type: "password",
      });

      await AsyncStorage.setItem("token", res.data.access_token);

      let u = await authApis(res.data.access_token).get(endpoints["current-user"]);

      dispatch({ type: "login", payload: u.data });

      nav.navigate("index");
    } catch (ex) {
      setMsg("Đăng nhập thất bại, vui lòng kiểm tra lại thông tin.");
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f0f4f7" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : null}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 40,
            paddingBottom: 20,
            flexGrow: 1,
            justifyContent: "center",
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo hoặc hình minh họa */}
          <View style={{ alignItems: "center", marginBottom: 32 }}>
            <Image
              source={require("../../assets/welcome.png")} // Thay bằng ảnh logo app của bạn
              style={{ width: 120, height: 120, borderRadius: 60 }}
              resizeMode="contain"
            />
            <Text style={{ fontSize: 24, fontWeight: "700", marginTop: 12, color: "#333" }}>
              Đăng nhập hệ thống KTX
            </Text>
          </View>

          {/* Thông báo lỗi chung */}
          {!!msg && (
            <HelperText type="error" visible={true} style={{ marginBottom: 12 }}>
              {msg}
            </HelperText>
          )}

          {/* Input login */}
          {info.map(({ label, field, icon, secureTextEntry }) => (
            <TextInput
              key={field}
              label={label}
              mode="outlined"
              style={{ marginBottom: 16 }}
              secureTextEntry={secureTextEntry}
              right={<TextInput.Icon icon={icon} />}
              value={user[field]}
              onChangeText={(text) => setState(text, field)}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType={field === "username" ? "default" : "default"}
            />
          ))}

          {/* Nút đăng nhập */}
          <Button
            mode="contained"
            onPress={login}
            loading={loading}
            disabled={loading}
            style={{ marginVertical: 12, borderRadius: 24, paddingVertical: 6 }}
            contentStyle={{ height: 44 }}
          >
            Đăng nhập
          </Button>

          {/* Quên mật khẩu */}
          <TouchableOpacity
            onPress={() => nav.navigate("ForgotPassword")} // Bạn tạo màn hình quên mật khẩu nếu cần
            style={{ marginBottom: 16 }}
          >
            <Text style={{ color: "#2e86de", textAlign: "right" }}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          {/* Chuyển sang đăng ký */}
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <Text>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => nav.navigate("register")}>
              <Text style={{ color: "#2e86de", fontWeight: "600" }}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;
