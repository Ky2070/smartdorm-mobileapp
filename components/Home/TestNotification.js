import React, { useEffect } from 'react';
import { Button, View, Text, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export default function TestNotificationScreen() {
  useEffect(() => {
    // Yêu cầu quyền gửi thông báo
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission not granted!');
      }
    };

    requestPermissions();
  }, []);

  const handleSendLocalNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Thông báo',
        body: 'Ký túc xá sẽ cúp nước vào thứ 7 tuần này!',
      },
      trigger: { seconds: 5 },
    });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Test Local Notification</Text>
      <Button title="Send Notification" onPress={handleSendLocalNotification} />
    </View>
  );
}
