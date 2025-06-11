import React, { useContext, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Animated,
  useWindowDimensions,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { MyUserContext } from '../../configs/MyContexts';
import { authApis, endpoints } from '../../configs/Apis';
import AsyncStorage from "@react-native-async-storage/async-storage";
import RenderHTML from 'react-native-render-html';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import messaging from '@react-native-firebase/messaging';

const API_BASE_URL = "https://nquocky.pythonanywhere.com";

const Rooms = ({ navigation }) => {
  const user = useContext(MyUserContext);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [swapRequest, setSwapRequest] = useState(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);

  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();  // <-- lấy thông tin safe area

  // const lastSwapCreatedAt = new Date(swapRequest.data[0].processed_at);
  // console.log(lastSwapCreatedAt);

  const [canSwap, setCanSwap] = useState(true);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() =>{
    if (swapRequest && swapRequest.processed_at){
      const createdAt = new Date(swapRequest.processed_at);
      const now = new Date();
      const diffDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
      if (diffDays < 14) {
        setCanSwap(false);
        setDaysLeft(14 - diffDays);
      } else {
        setCanSwap(true);
        setDaysLeft(0);
      }
    } else {
      setCanSwap(true);
      setDaysLeft(0);
    }
  }, [swapRequest]);


  // Hàm load hóa đơn phòng mình
  const loadInvoices = async () => {
    try {
      setLoadingInvoices(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      const api = authApis(token);

      const res = await api.get(endpoints['invoices']);

      // Tính total_amount từ invoice_details
      const updatedInvoices = res.data.map(invoice => {
      const total = invoice.invoice_details.reduce((sum, detail) => {
      const amount = parseFloat(detail.amount); // chuyển về float
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      return { ...invoice, total_amount: total };
    });

      setInvoices(updatedInvoices);
    } catch (err) {
      console.log("Lỗi load hóa đơn:", err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  useEffect(() => {
    if (room) {
      if (invoices){
        loadInvoices();
      }
    } else {
      setLoadingInvoices(false);
    }
  }, []);

  // useFocusEffect(
  //   useCallback(() =>{
  //     loadMyRoom();
  //   }, [])
  // );
  const sendFcmToken = async () => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log("FCM permission denied");
        return;
      }

      const token = await messaging().getToken();
      console.log("FCM Token:", token);

      const savedToken = await AsyncStorage.getItem("fcmToken");
      if (token === savedToken) {
        console.log("Token đã được gửi trước đó");
        return;
      }

      const userToken = await AsyncStorage.getItem("token");
      if (!userToken) return;

      await authApis(userToken).post(endpoints['fcm'], {token});
      console.log("✅ FCM token đã được gửi về server");
      await AsyncStorage.setItem("fcmToken", token);
    } catch (error) {
      console.error("❌ Lỗi gửi FCM token:", error);
    }
  };

  useEffect(() => {
    const checkAndSendToken = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) await sendFcmToken();
    }
    checkAndSendToken();
  }, []);

  const loadMyRoom = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Chưa đăng nhập", "Bạn cần đăng nhập để đăng ký phòng.", [
          { text: "Hủy", style: "cancel" },
          { text: "Đăng nhập", onPress: () => navigation.navigate("login") }
        ]);
        setLoading(false);
        return;
      }
      const api = authApis(token);
      const res = await api.get(endpoints['my-room']);
      let roomData = res.data;
      if (roomData.image && !roomData.image.startsWith("http")) {
        roomData.image = API_BASE_URL + roomData.image;
      }
      if (JSON.stringify(roomData) !== JSON.stringify(room)) {
        setRoom(roomData);
      }

      const swapRes = await api.get(endpoints['room-swap']);
      if (swapRes.data && swapRes.data.length > 0) {
        if (JSON.stringify(swapRes.data[0]) !== JSON.stringify(swapRequest)) {
          setSwapRequest(swapRes.data[0]);
        }
        const lastSwapCreatedAt = new Date(swapRes.data[0].processed_at);
        console.log(lastSwapCreatedAt);
      } else {
        setSwapRequest(null);
      }
    } catch (err) {
      Alert.alert("Bạn hiện tại chưa đăng ký phòng nào.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyRoom();
  }, [swapRequest]);

  useEffect(() => {
    if (!loading && room) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, room, opacity, translateY]);

  // Hàm xử lý thanh toán
  const handlePayInvoice = async (invoiceId) => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          Alert.alert("Chưa đăng nhập", "Bạn cần đăng nhập để thanh toán.");
          return;
        }
        const api = authApis(token);

        // Gọi API thanh toán hóa đơn (endpoint: /invoices/{id}/pay/)
        const res = await api.patch(`${endpoints['invoices']}${invoiceId}/pay/`, {
          payment_method: 1,
        });

        if (res.status === 200) {
          const paymentUrl = res.data.payment_url;
          // Mở url thanh toán
          Linking.openURL(paymentUrl);

          setTimeout(() => {
            loadInvoices();
          }, 5000);
        } else {
          Alert.alert("Lỗi", "Không thể tạo link thanh toán.");
        }
      } catch (error) {
        Alert.alert("Lỗi thanh toán", error.response?.data?.detail || error.message);
      }
    };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#2980b9" />;

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView contentContainerStyle={[styles.scrollContainer]}>
        {room ? (
          <>
          <Animated.View style={[styles.card, { opacity, transform: [{ translateY }] }]}>
            <Image source={{ uri: room.image }} style={styles.image} />
            <View style={styles.infoContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{room.name}</Text>

                <View style={styles.genderTag}>
                  <MaterialIcons
                    name={room.gender_restriction === "male" ? "male" : "female"}
                    size={18}
                    color={room.gender_restriction === "male" ? "#007AFF" : "#FF2D55"}
                  />
                  <Text style={[styles.genderText, {
                    color: room.gender_restriction === "male" ? "#007AFF" : "#FF2D55"
                  }]}>
                    {room.gender_restriction === "male" ? "Nam" : "Nữ"}
                  </Text>
                </View>
              </View>

              <View style={styles.statusRow}>
                <MaterialIcons name="meeting-room" size={20} color="#555" />
                <Text style={styles.statusText}>
                  {room.current_students < room.capacity ? "Phòng còn chỗ" : "Phòng đã đầy"}
                </Text>
                <Text style={styles.capacityText}>
                  ({room.current_students}/{room.capacity} SV)
                </Text>
              </View>

              <RenderHTML contentWidth={width} source={{ html: room.description || "<p>Không có mô tả</p>" }} />

              <TouchableOpacity
                style={[styles.swapButton, { backgroundColor: canSwap ? '#FF9800' : '#ccc' }]}
                onPress={() => {
                  if (canSwap) {
                    navigation.navigate("RoomSwap", { currentRoomId: room.id });
                  } else {
                    Alert.alert(
                      "Không thể đổi phòng",
                      `Bạn chỉ có thể yêu cầu đổi phòng sau ${daysLeft} ngày nữa kể từ lần yêu cầu gần nhất.`
                    );
                  }
                }}
                disabled={!canSwap}
              >
                <Text style={styles.swapButtonText}>Đổi phòng</Text>
              </TouchableOpacity>
              {!canSwap && (
                <Text style={{ marginTop: 8, color: 'red', textAlign: 'center' }}>
                  Bạn cần chờ {daysLeft} ngày nữa để đổi phòng.
                </Text>
              )}
            </View>
          </Animated.View>
          {/* Phần riêng biệt hiển thị trạng thái yêu cầu chuyển phòng */}
        {swapRequest && (
          <View style={[styles.swapStatusContainer]}>
            <Text style={styles.swapStatusTitle}>Trạng thái yêu cầu chuyển phòng:</Text>
            <Text style={styles.swapStatusText}>
              {swapRequest.processed_at === null && swapRequest.is_approved === false && "⏳ Đang chờ duyệt"}
              {swapRequest.is_approved === true && "✅ Yêu cầu chuyển phòng đã được duyệt"}
              {swapRequest.processed_at !== null && swapRequest.is_approved === false && "❌ Yêu cầu chuyển phòng bị từ chối"}
            </Text>
            {swapRequest.desired_room && (
              <Text style={styles.swapStatusRoom}>Từ {swapRequest.current_room.name} - đến {swapRequest.desired_room.name}</Text>
            )}
          </View>
        )}
          </>
        ) : (
          <View style={styles.noRoomContainer}>
            <Text style={styles.noRoomText}>Bạn chưa đăng ký phòng nào.</Text>
          </View>
        )}
        {/* Hiển thị danh sách hóa đơn phòng */}
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12, color: '#34495e' }}>
            Hóa đơn phòng của bạn
          </Text>

          {loadingInvoices ? (
            <ActivityIndicator size="small" color="#2980b9" />
          ) : invoices.length === 0 ? (
            <Text style={{ color: '#888' }}>Chưa có hóa đơn nào.</Text>
          ) : (
            invoices.map((invoice) => (
              <View key={invoice.id} style={{
                backgroundColor: '#fff',
                borderRadius: 10,
                padding: 12,
                marginBottom: 12,
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowOffset: { width: 0, height: 1 },
                shadowRadius: 4,
                elevation: 1,
              }}>
                <Text style={{ fontWeight: '600', fontSize: 16, color: '#2c3e50' }}>
                  Hóa đơn tháng: {new Date(invoice.billing_period).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}
                </Text>
                {invoice.invoice_details.map((detail, index) => (
                  <Text key={index} style={{ fontSize: 13, color: '#555' }}>
                    • {detail.fee_type.name}: {detail.amount.toLocaleString()} VNĐ
                  </Text>
                ))}
                <Text style={{ marginTop: 4, fontSize: 15, color: '#34495e' }}>
                  Tổng tiền: {invoice.total_amount != null ? invoice.total_amount.toLocaleString() : 'N/A'} VNĐ
                </Text>
                <Text style={{ marginTop: 4, fontSize: 14, color: invoice.is_paid ? 'green' : 'red', fontWeight: '600' }}>
                  {invoice.is_paid ? "Đã thanh toán" : "Chưa thanh toán"}
                </Text>

                {!invoice.is_paid && (
                  <TouchableOpacity
                    onPress={() => handlePayInvoice(invoice.id)}
                    style={{
                      marginTop: 10,
                      backgroundColor: '#27ae60',
                      paddingVertical: 10,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Thanh toán</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6fc',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2980b9',
    fontWeight: '600',
  },
  capacityText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#7f8c8d',
  },
  noRoomContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  noRoomText: {
    fontSize: 18,
    color: '#888',
  },

  swapButton: {
    marginTop: 16,
    backgroundColor: '#FF9800', // màu cam nổi bật
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  swapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  swapStatusContainer: {
  marginTop: 20,
  backgroundColor: '#f1f8e9',
  padding: 15,
  borderRadius: 10,
  shadowColor: '#33691E',
  shadowOpacity: 0.3,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
  elevation: 2,
},
swapStatusTitle: {
  fontWeight: 'bold',
  color: '#33691E',
  fontSize: 16,
},
swapStatusText: {
  color: '#558B2F',
  marginTop: 8,
  fontSize: 15,
},
swapStatusRoom: {
  marginTop: 6,
  fontWeight: '600',
  color: '#33691E',
  fontSize: 15,
},
titleRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 10,
},

genderTag: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#ecf0f1',
  borderRadius: 12,
  paddingHorizontal: 8,
  paddingVertical: 2,
  alignSelf: 'center',
  marginBottom: 10,
},

genderText: {
  marginLeft: 4,
  fontSize: 14,
  lineHeight: 18,
  fontWeight: '500',
}
});

export default Rooms;
