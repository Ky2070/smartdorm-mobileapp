import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Animated,
} from "react-native";
import { Icon } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ⚠️ Tạm thời để các screen đang *chưa có* trong project
const availableScreens = {
  RoomManagement: true,
  InvoiceManagement: false,
  SupportRequests: false,
};

const menuItems = [
  {
    icon: "office-building",
    text: "Quản lý phòng ở",
    screen: "RoomManagement",
  },
  {
    icon: "file-document",
    text: "Quản lý hóa đơn",
    screen: "InvoiceManagement",
  },
  {
    icon: "message-alert",
    text: "Yêu cầu hỗ trợ",
    screen: "SupportRequests",
  },
];

// Component con cho mỗi item, có animation fade + translateY
const AnimatedMenuItem = ({ item, index, onPress, disabled }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 400,
      delay: 150 * index,
      useNativeDriver: true,
    }).start();

    Animated.timing(translateY, {
      toValue: 0,
      duration: 400,
      delay: 150 * index,
      useNativeDriver: true,
    }).start();
  }, [opacity, translateY, index]);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
        marginBottom: 16,
      }}
    >
      <TouchableOpacity
        style={[styles.card, disabled && { opacity: 0.5 }]}
        onPress={() => onPress(item.screen)}
        activeOpacity={0.8}
        disabled={disabled}
      >
        <Icon source={item.icon} size={28} color="#2e86de" />
        <Text style={styles.cardText}>{item.text}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const AdminPanel = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const handlePress = (screen) => {
    if (availableScreens[screen]) {
      navigation.navigate(screen);
    } else {
      Alert.alert(
        "Tính năng chưa sẵn sàng",
        "Màn hình này chưa được phát triển. Vui lòng thử lại sau."
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 30,
          },
        ]}
      >
        <Text style={styles.title}>Bảng điều khiển Quản trị</Text>

        {menuItems.map((item, index) => (
          <AnimatedMenuItem
            key={item.text}
            item={item}
            index={index}
            onPress={handlePress}
            disabled={!availableScreens[item.screen]}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f6fc",
  },
  container: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#2e86de",
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardText: {
    marginLeft: 16,
    fontSize: 17,
    fontWeight: "600",
    color: "#2c3e50",
  },
});

export default AdminPanel;
