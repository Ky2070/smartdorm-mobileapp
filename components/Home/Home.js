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
      <Searchbar
        placeholder="Tìm kiếm phòng KTX..."
        value={q}
        onChangeText={setQ}
        style={{ marginBottom: 10, borderRadius: 30 }}
        onSubmitEditing={() => Keyboard.dismiss()}
      />

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
