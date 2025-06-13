import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';



const testNotifications = [
  {
    title: '🔔 Cúp nước',
    body: 'Ký túc xá sẽ cúp nước từ 9h đến 17h ngày mai.',
  },
  {
    title: '⚠️ Cảnh báo an ninh',
    body: 'Có sự cố tại tòa nhà B. Vui lòng hạn chế ra vào.',
  },
  {
    title: '📢 Thông báo họp',
    body: 'Họp toàn thể sinh viên vào 19h tối nay tại hội trường.',
  },
  {
    title: '🎉 Chúc mừng',
    body: 'Bạn được tặng 10 điểm thưởng vì thanh toán sớm!',
  },
];

export default function TestNotificationScreen() {
  const [expoPushToken, setExpoPushToken] = useState(null);

   useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      Alert.alert(
        notification.request.content.title,
        notification.request.content.body
      );
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const requestPermissions = async () => {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        console.log('Notification permission:', finalStatus);
        if (finalStatus !== 'granted') {
          Alert.alert('Thông báo', 'Bạn chưa cấp quyền thông báo!');
        }

        const token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log('Expo Push Token:', token);
        setExpoPushToken(token);
      } else {
        Alert.alert('Thông báo', 'Thông báo chỉ hoạt động trên thiết bị thực!');
      }
    };

    requestPermissions();
  }, []);

  const sendLocalNotification = async (title, body) => {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { customData: 'xyz' },
        },
        trigger: { seconds: 3 },
      });

      console.log("Đã lên lịch thông báo, ID:", id);
    } catch (error) {
      console.error("Lỗi gửi thông báo:", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>🧪 Thông Báo Toàn Hệ Thống KTX</Text>

      {testNotifications.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.button}
          onPress={() => sendLocalNotification(item.title, item.body)}
        >
          <Text style={styles.buttonText}>{item.title}</Text>
          <Text style={styles.bodyText}>{item.body}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.token}>Push Token: {expoPushToken || 'Đang lấy...'}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    marginVertical: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#4e73df',
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  bodyText: {
    color: '#f1f1f1',
    fontSize: 14,
    marginTop: 4,
  },
  token: {
    marginTop: 20,
    fontSize: 12,
    color: 'gray',
  },
});