import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState, useRef } from "react";
import Apis, { endpoints } from "../../configs/Apis";
import {
  ActivityIndicator,
  Animated,
  SafeAreaView,
  TouchableOpacity,
  View,
  Text,
  Keyboard,
} from "react-native";
import MyStyles from "../../styles/MyStyles";
import { Chip, Searchbar, Card } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "@react-native-vector-icons/material-design-icons";

const RoomCard = ({ item, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.65,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={{ flex: 1, margin: 8 }}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Card
          style={{
            borderRadius: 12,
            elevation: 5,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowOffset: { width: 0, height: 3 },
            shadowRadius: 6,
          }}
        >
          <Card.Cover
            source={
              item.image ? { uri: item.image } : require("../../assets/favicon.png")
            }
            style={{ height: 120 }}
            resizeMode="cover"
          />
          <Card.Content>
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>{item.name}</Text>
            <Text style={{ color: "#555" }}>Sức chứa: {item.capacity}</Text>
          </Card.Content>
        </Card>
      </Animated.View>
    </TouchableOpacity>
  );
};
const AnimatedFlatList = Animated.createAnimatedComponent(Animated.FlatList);

const Home = () => {
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buildId, setBuildId] = useState(null);
  const [q, setQ] = useState("");
  const [canLoadMore, setCanLoadMore] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const pageRef = useRef(1);
  const listRef = useRef();
  const searchTimeout = useRef();
  const nav = useNavigation();
  const insets = useSafeAreaInsets();

  const loadBuilds = async () => {
    try {
      let res = await Apis.get(endpoints["buildings"]);
      setBuildings(res.data);
    } catch (err) {
      console.error("Lỗi khi load buildings:", err);
    }
  };

  const loadRooms = async (reset = false) => {
    if (loading || (!reset && !canLoadMore)) return;

    setLoading(true);
    try {
      const page = reset ? 1 : pageRef.current;
      let url = `${endpoints["rooms"]}?page=${page}`;

      if (buildId) url += `&building_id=${buildId}`;
      if (q.trim()) url += `&search=${encodeURIComponent(q.trim())}`;

      const res = await Apis.get(url);
      const newRooms = reset ? res.data.results : [...rooms, ...res.data.results];

      setRooms(newRooms);
      setCanLoadMore(res.data.next !== null);
      pageRef.current = page + 1;
    } catch (err) {
      console.error("Lỗi load phòng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadFakeNotifications = () => {
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

      const unread = fakeData.filter(n => !n.read).length;
      setUnreadCount(unread);
    };

    loadFakeNotifications();
  }, []);

  useEffect(() => {
    pageRef.current = 1;
    setCanLoadMore(true);
    loadRooms(true);
  }, [buildId]);

  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      pageRef.current = 1;
      setCanLoadMore(true);
      loadRooms(true);
    }, 500);
    return () => clearTimeout(searchTimeout.current);
  }, [q]);

  useEffect(() => {
    loadBuilds();
  }, []);

  useEffect(() => {
    const unsubscribe = nav.addListener("focus", () => {
      setUnreadCount(0);
    });

    return unsubscribe;
  }, [nav]);

  const onScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > 300);
  };

  return (
    <SafeAreaView
      style={[
        MyStyles.container,
        { paddingHorizontal: 10, paddingBottom: insets.bottom + 10 },
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <Searchbar
          placeholder="Tìm kiếm phòng KTX..."
          value={q}
          onChangeText={setQ}
          style={{ flex: 1, borderRadius: 30 }}
          onSubmitEditing={() => Keyboard.dismiss()}
        />
        <TouchableOpacity
          onPress={() => nav.navigate("Notifications")}
          style={{ marginLeft: 8 }}
        >
          <View>
            <Icon name="bell" size={28} color="#333" />
            {unreadCount > 0 && (
              <View
                style={{
                  position: "absolute",
                  right: -4,
                  top: -4,
                  backgroundColor: "red",
                  borderRadius: 10,
                  width: 18,
                  height: 18,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>


         {/* ✅ Nút chuyển sang màn test local notification */}
        <TouchableOpacity
          onPress={() => nav.navigate("TestNotification")}
          style={{
            marginLeft: 8,
            backgroundColor: "#27ae60",
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 12 }}>
            Mẫu thông báo
          </Text>
        </TouchableOpacity>
      </View>



      <View style={[MyStyles.row, MyStyles.wrap, { marginBottom: 10 }]}>
        <Chip
          icon="home-group"
          selected={!buildId}
          onPress={() => setBuildId(null)}
          style={MyStyles.m}
        >
          Tất cả
        </Chip>
        {buildings.map((b) => (
          <Chip
            key={b.id}
            icon="home-city"
            selected={buildId === b.id}
            onPress={() => setBuildId(b.id)}
            style={MyStyles.m}
          >
            {b.name} - {b.address}
          </Chip>
        ))}
      </View>

      <AnimatedFlatList
        ref={listRef}
        data={rooms}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <RoomCard
            item={item}
            onPress={() => nav.navigate("RoomDetail", { RoomId: item.id })}
          />
        )}
        numColumns={2}
        onEndReached={() => loadRooms()}
        onEndReachedThreshold={0.3}
        ListFooterComponent={loading ? <ActivityIndicator size="large" /> : null}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {showScrollTop && (
        <TouchableOpacity
          onPress={() => listRef.current.scrollToOffset({ animated: true, offset: 0 })}
          style={{
            position: "absolute",
            right: 20,
            bottom: insets.bottom + 40,
            backgroundColor: "#2980b9",
            padding: 12,
            borderRadius: 20,
            elevation: 5,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>↑ Đầu trang</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default Home;
