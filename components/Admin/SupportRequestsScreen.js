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
  ScrollView,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import styles from "./Styles/SupportRequestStyles";

const SupportRequestsScreen = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emergencyMessage, setEmergencyMessage] = useState("");
  const [targetRoom, setTargetRoom] = useState("all");
  const [roomList, setRoomList] = useState([{ label: "Tất cả", value: "all" }]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchSupportRequests();
    fetchRegisteredRooms();
  }, []);

  const fetchSupportRequests = async () => {
    try {
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

  const fetchRegisteredRooms = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await authApis(token).get(endpoints["register-room"]);
      const activeRegs = res.data;

      const uniqueRooms = activeRegs
        .filter((reg) => reg.is_active)
        .map((reg) => ({
          id: reg.room.id,
          name: reg.room.name,
          building: { name: reg.building_name },
        }))
        .filter(
          (room, index, self) =>
            index ===
            self.findIndex(
              (r) =>
                r.name === room.name && r.building.name === room.building.name
            )
        );

      const roomChoices = uniqueRooms.map((r) => ({
        label: `Phòng ${r.name} - ${r.building.name}`,
        value: `room_${r.id}`,
      }));

      setRoomList([{ label: "Tất cả", value: "all" }, ...roomChoices]);
    } catch (error) {
      console.error("Lỗi tải danh sách phòng", error);
      Alert.alert("Lỗi", "Không thể tải danh sách phòng.");
    }
  };

  const sendEmergencyNotification = async () => {
    if (!emergencyMessage.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập nội dung thông báo khẩn.");
      return;
    }

    try {
      setSending(true);
      await Apis.post(endpoints["send_notification"], {
        message: emergencyMessage,
        target: targetRoom,
      });

      Alert.alert("✅ Thành công", "Đã gửi thông báo khẩn.");
      setEmergencyMessage("");
    } catch (err) {
      console.error("Send notification error:", err);
      Alert.alert("❌ Lỗi", "Không thể gửi thông báo.");
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.requestItem}>
      <Text style={styles.student}>{item.student}</Text>
      <Text style={styles.message}>{item.message}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📋 Danh sách yêu cầu hỗ trợ</Text>
      {loading ? (
        <ActivityIndicator animating size="large" />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          scrollEnabled={false}
        />
      )}

      <View style={styles.emergencySection}>
        <Text style={styles.subtitle}>🚨 Gửi thông báo khẩn</Text>

        <View style={styles.pickerWrapper}>
          <Text style={styles.pickerLabel}>Chọn phòng nhận:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={targetRoom}
              onValueChange={setTargetRoom}
              style={styles.picker}
            >
              {roomList.map((room) => (
                <Picker.Item key={room.value} label={room.label} value={room.value} />
              ))}
            </Picker>
          </View>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Nhập nội dung thông báo..."
          value={emergencyMessage}
          onChangeText={setEmergencyMessage}
          multiline
          numberOfLines={4}
        />
        <TouchableOpacity
          style={[styles.sendButton, sending && { opacity: 0.6 }]}
          onPress={sendEmergencyNotification}
          disabled={sending}
        >
          <Text style={styles.sendButtonText}>
            {sending ? "Đang gửi..." : "📨 Gửi thông báo"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SupportRequestsScreen;
