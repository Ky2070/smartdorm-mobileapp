import React, { useEffect, useState } from 'react';
import { Button, View, Text, Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export default function TestNotificationScreen() {
  const [expoPushToken, setExpoPushToken] = useState(null);

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

  const handleSendLocalNotification = async () => {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 Thông báo test',
          body: 'Ký túc xá sẽ cúp nước vào thứ 7 tuần này!',
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
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Test Local Notification</Text>
      <Button title="Send Notification" onPress={handleSendLocalNotification} />
    </View>
  );
}
