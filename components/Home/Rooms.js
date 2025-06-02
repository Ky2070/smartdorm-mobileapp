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
} from 'react-native';
import { MyUserContext } from '../../configs/MyContexts';
import { authApis, endpoints } from '../../configs/Apis';
import AsyncStorage from "@react-native-async-storage/async-storage";
import RenderHTML from 'react-native-render-html';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_BASE_URL = "https://nquocky.pythonanywhere.com";

const Rooms = ({ navigation }) => {
  const user = useContext(MyUserContext);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();  // <-- lấy thông tin safe area

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
      setRoom(roomData);
    } catch (err) {
      Alert.alert("Bạn hiện tại chưa đăng ký phòng nào.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyRoom();
  }, []);

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

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#2980b9" />;

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView contentContainerStyle={[styles.scrollContainer]}>
        {room ? (
          <Animated.View style={[styles.card, { opacity, transform: [{ translateY }] }]}>
            <Image source={{ uri: room.image }} style={styles.image} />
            <View style={styles.infoContainer}>
              <Text style={styles.title}>{room.name}</Text>

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
            </View>
          </Animated.View>
        ) : (
          <View style={styles.noRoomContainer}>
            <Text style={styles.noRoomText}>Bạn chưa đăng ký phòng nào.</Text>
          </View>
        )}
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
    marginBottom: 12,
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
});

export default Rooms;
