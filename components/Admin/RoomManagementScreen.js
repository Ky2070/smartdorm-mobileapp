import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { endpoints, authApis } from "../../configs/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RoomManagementScreen = () => {
  
  const [registrations, setRegistrations] = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchData = async () => {
    const token = await AsyncStorage.getItem("token");
    const api = authApis(token);
    setLoading(true);
    try {
      // Lấy danh sách đăng ký phòng thật từ API
      const res = await api.get(endpoints['register-room']);
      setRegistrations(res.data);
      const swapRes = await api.get(endpoints['list-swap']);
      setChangeRequests(swapRes.data); 

      // Log thông tin người duyệt đơn
      swapRes.data.forEach(item => {
        console.log(`Yêu cầu đổi phòng ID ${item.id} - Người duyệt:`, item.processed_by);
      });

    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu từ server.");
    } finally {
      setLoading(false);
    }
  };

  const updateSwapStatus = async (id, action) => {
    const token = await AsyncStorage.getItem("token");
    const api = authApis(token);

    try {
      const url = `${endpoints['room-swap']}${id}/${action}/`; // vd: /room-swap/2/approve/
      console.log(url);
      await api.put(url);
      Alert.alert("Thành công", `Yêu cầu đã được ${action === "approve" ? "duyệt" : "từ chối"}.`);
      fetchData(); // Làm mới danh sách
    } catch (error) {
      Alert.alert("Lỗi", `Không thể ${action === "approve" ? "duyệt" : "từ chối"} yêu cầu.`);
    }
  };

  const handleApprove = (id) => {
    Alert.alert(
      "Xác nhận duyệt",
      "Bạn có chắc chắn muốn duyệt yêu cầu này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Duyệt",
          onPress: () => updateSwapStatus(id, "approve"),
        },
      ]
    );
  };

  const handleReject = (id) => {
    Alert.alert(
      "Xác nhận từ chối",
      "Bạn có chắc chắn muốn từ chối yêu cầu này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Từ chối",
          onPress: () => updateSwapStatus(id, "reject"),
        },
      ]
    );
  };

  const mapStatus = (statusText) => {
    switch (statusText) {
      case "Chờ duyệt":
        return "pending";
      case "Đã duyệt":
        return "approved";
      case "Từ chối":
        return "rejected";
      default:
        return "unknown";
    }
  };

  const filteredRequests =
    filterStatus === "all"
      ? changeRequests
      : changeRequests.filter((r) => mapStatus(r.status) === filterStatus);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Danh sách đăng ký phòng</Text>
      <FlatList
        data={registrations}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Sinh viên: {item.student_name} ({item.student_code})</Text>
            <Text>Phòng: {item.room.name}</Text>
            <Text>Tòa nhà: {item.building_name}</Text>
            <Text>Ngày đăng ký: {new Date(item.registered_at).toLocaleString()}</Text>
            <Text>Trạng thái: {item.is_active ? "Đang ở" : "Đã rời đi"}</Text>
          </View>
        )}
      />

      <Text style={styles.title}>Yêu cầu đổi phòng</Text>

      {/* Bộ lọc trạng thái */}
      <View style={styles.filterContainer}>
        {["all", "pending", "approved", "rejected"].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              filterStatus === status && styles.activeFilter,
            ]}
            onPress={() => setFilterStatus(status)}
          >
            <Text
              style={[
                styles.filterText,
                filterStatus === status && styles.activeFilterText,
              ]}
            >
              {status.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Danh sách có animation */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <FlatList
          data={filteredRequests}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text>Sinh viên: {item.student.first_name} {item.student.last_name}</Text>
              <Text>Từ phòng: {item.current_room?.name} (Tòa {item.current_room?.building_name})</Text>
              <Text>Đến phòng: {item.desired_room?.name} (Tòa {item.desired_room?.building_name})</Text>
              <Text>Lý do: {item.reason}</Text>
              <Text
                style={{
                  color:
                    mapStatus(item.status) === "pending"
                      ? "#f39c12"
                      : mapStatus(item.status) === "approved"
                      ? "green"
                      : "red",
                  fontWeight: "bold",
                }}>
                Trạng thái: {item.status}
              </Text>
              <Text>Người duyệt: {item.processed_by === 1 ? "Quản trị viên" : "Chưa duyệt"}</Text>
              {mapStatus(item.status) === "pending" && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => {
                      if (item.desired_room?.is_full){
                        Alert.alert('Phòng đã đầy, không thể duyệt');
                        return;
                      }
                      handleApprove(item.id)}}
                  >
                    <Text style={styles.btnText}>Duyệt</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => handleReject(item.id)}
                  >
                    <Text style={styles.btnText}>Từ chối</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 12,
  },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  actions: {
    flexDirection: "row",
    marginTop: 10,
  },
  approveBtn: {
    backgroundColor: "green",
    padding: 8,
    borderRadius: 6,
    marginRight: 10,
  },
  rejectBtn: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 6,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  filterContainer: {
    flexDirection: "row",
    marginVertical: 10,
    justifyContent: "space-around",
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bbb",
    backgroundColor: "#f0f0f0",
  },
  activeFilter: {
    backgroundColor: "#4a90e2",
    borderColor: "#4a90e2",
  },
  filterText: {
    fontWeight: "bold",
    color: "#333",
  },
  activeFilterText: {
    color: "#fff",
  },
});

export default RoomManagementScreen;
