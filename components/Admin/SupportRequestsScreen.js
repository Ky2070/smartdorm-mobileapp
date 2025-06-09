// screens/SupportRequestsScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { IconButton, ActivityIndicator } from "react-native-paper";

const SupportRequestsScreen = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emergencyMessage, setEmergencyMessage] = useState("");

  useEffect(() => {
    // TODO: Replace with real API call
    fetchSupportRequests();
  }, []);

  const fetchSupportRequests = async () => {
    setLoading(true);
    try {
      // Giả lập dữ liệu
      const fakeData = [
        { id: 1, student: "Nguyễn Văn A", message: "Wifi không hoạt động" },
        { id: 2, student: "Trần Thị B", message: "Phòng bị mất điện" },
      ];
      setRequests(fakeData);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải danh sách hỗ trợ.");
    } finally {
      setLoading(false);
    }
  };

  const sendEmergencyNotification = async () => {
    if (!emergencyMessage.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập nội dung thông báo khẩn.");
      return;
    }

    try {
      // TODO: Gửi emergencyMessage tới backend để broadcast FCM
      Alert.alert("Thành công", "Đã gửi thông báo khẩn đến sinh viên.");
      setEmergencyMessage("");
    } catch (err) {
      Alert.alert("Lỗi", "Không thể gửi thông báo.");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.requestItem}>
      <Text style={styles.student}>{item.student}</Text>
      <Text style={styles.message}>{item.message}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách yêu cầu hỗ trợ</Text>
      {loading ? (
        <ActivityIndicator animating size="large" />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}

      <View style={styles.emergencySection}>
        <Text style={styles.subtitle}>Gửi thông báo khẩn:</Text>
        <TextInput
          style={styles.input}
          placeholder="Nội dung thông báo..."
          value={emergencyMessage}
          onChangeText={setEmergencyMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendEmergencyNotification}>
          <Text style={styles.sendButtonText}>Gửi thông báo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SupportRequestsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f4f6fc",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#2e86de",
  },
  requestItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  student: {
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 16,
  },
  message: {
    fontSize: 14,
    color: "#333",
  },
  emergencySection: {
    marginTop: 30,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  sendButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
