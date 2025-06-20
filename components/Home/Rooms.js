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
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import styles from './Styles/RoomStyles';

const API_BASE_URL = "https://nquocky.pythonanywhere.com";

const Rooms = ({ navigation }) => {
  const user = useContext(MyUserContext);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [swapRequest, setSwapRequest] = useState(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

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


  const loadNotifications = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;

    const api = authApis(token);
    const res = await api.get(endpoints['notifications']);
    setNotifications(res.data);
  } catch (err) {
    console.error("Lỗi load thông báo:", err);
  }
};

 useEffect(() => {
  loadNotifications();
 }, []);

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
      if(!Device.isDevice){
        console.log('Phải sử dụng thiết bị thật để nhận push token');
        return;
      }
      
      const {status: existingStatus} = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Quyền thông báo bị từ chối!');
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;
      console.log('Expo Push Token:', token);

      const savedToken = await AsyncStorage.getItem("fcmToken");
      if (token === savedToken) {
        console.log("Token đã được gửi trước đó");
        return;
      }

      const userToken = await AsyncStorage.getItem("token");
      if (!userToken) return;

      await authApis(userToken).post(endpoints['fcm'], {token});
      console.log('✅ Expo push token đã được gửi về server');
      await AsyncStorage.setItem("fcmToken", token);
    } catch (error) {
      console.error('❌ Lỗi gửi Expo push token:', error);
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
                <TouchableOpacity onPress={() => setShowNotifications(true)}>
                  <MaterialIcons name="notifications" size={24} color="#FF9800" />
                </TouchableOpacity>

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
      {showNotifications && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thông báo từ quản trị viên</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {notifications.length === 0 ? (
                <Text style={{ color: '#888' }}>Không có thông báo nào.</Text>
              ) : (
                notifications.map((noti, index) => (
                  <View key={index} style={styles.notificationItem}>
                    <Text style={styles.notificationTitle}>{noti.title}</Text>
                    <Text style={styles.notificationBody}>{noti.message}</Text>
                    <Text style={styles.notificationTime}>
                      {new Date(noti.created_at).toLocaleString("vi-VN")}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
            <TouchableOpacity onPress={() => setShowNotifications(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Rooms;
