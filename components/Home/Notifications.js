import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import Apis, { endpoints } from "../../configs/Apis";

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadNoti = async () => {
        try {
            // const res = await Apis.get(endpoints["notifications"]);
            // setNotifications(res.data);
            
            const fakeData = [
                {
                id: 1,
                title: "Cúp điện toàn ký túc xá",
                message: "Ký túc xá sẽ bị cúp điện từ 14h đến 17h hôm nay.",
                read: false,
                },
                {
                id: 2,
                title: "Thông báo đóng tiền",
                message: "Hạn chót đóng tiền phòng là ngày 15/06.",
                read: false,
                },
                {
                id: 3,
                title: "Bảo trì hệ thống nước",
                message: "Hệ thống nước sẽ bảo trì vào sáng thứ 7 tuần này.",
                read: false,
                },
            ];
        setNotifications(fakeData);
        } catch (error){
            console.error("Lỗi khi load thông báo", error);
        } 
    };
    loadNoti();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.title || "Thông báo"}</Text>
      <Text>{item.message}</Text>
    </View>
  );

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16 }}
    />
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  item: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 10,
    elevation: 2,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 4,
  },
});
