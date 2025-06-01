import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import Apis, { endpoints } from "../../configs/Apis";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  View,
  Image,
  Text
} from "react-native";
import MyStyles from "../../styles/MyStyles";
import { Chip, Searchbar, Card } from "react-native-paper";

const Home = () => {
    const [buildings, setBuildings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [buildId, setBuildId] = useState(null);
    const [q, setQ] = useState("");
     const [page, setPage] = useState(1);
    const nav = useNavigation();

    const loadBuilds = async () => {
    try {
        let res = await Apis.get(endpoints['buildings']);
        // console.log("Danh sách tòa nhà:", res.data); // 👈 log dữ liệu
        setBuildings(res.data);
    } catch (err) {
        console.error("Lỗi khi load buildings:", err);
        }
    }

    const loadRooms = async () => {
        if (page > 0){
            let url = `${endpoints['rooms']}?page=${page}`;
            
            if (buildId) {
                url = `${url}&building_id=${buildId}`;
            }

            try {
            setLoading(true);
            let res = await Apis.get(url);
            // console.log(`Dữ liệu phòng (page ${page}):`, res.data); // 👈 log kết quả
            setRooms([...rooms, ...res.data.results]);
            
            if(res.data.next === null)
                setPage(0);
            }catch{

            }finally {
                setLoading(false);
            }
        }   
    }

    useEffect(() => {
        loadBuilds();
    }, []);

    useEffect(() => {
        let timer = setTimeout(() =>{
            loadRooms();
        }, 500);
        
        return () => clearTimeout(timer);
    }, [page]);

    useEffect(() => {
        setPage(1);
        setRooms([]);
    }, [buildId]);

    useEffect(() => {
        if (rooms.length === 0 && page === 1) {
            loadRooms(); // Load ngay khi chọn tòa mới
        }
    }, [rooms, page]);

    const loadMore = () => {
        if (!loading && page > 0){
            setPage(page + 1);
        }
    }

    return (
        <SafeAreaView style={[MyStyles.container, { padding: 10 }]}>
        <Searchbar
            placeholder="Tìm kiếm phòng KTX..."
            value={q}
            onChangeText={setQ}
            style={{ marginBottom: 10, borderRadius: 30 }}
        />

        <View style={[MyStyles.row, MyStyles.wrap, { marginBottom: 10 }]}>
            <Chip
            icon="home-group"
            selected={!buildId}
            onPress={() => setBuildId(null)}
            style={[MyStyles.m]}
            >
            Tất cả
            </Chip>
            {buildings.map((b) => (
            <Chip
                key={b.id}
                icon="home-city"
                selected={buildId === b.id}
                onPress={() => setBuildId(b.id)}
                style={[MyStyles.m]}
            >
                {b.name}
            </Chip>
            ))}
        </View>

        <FlatList
            data={rooms}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderRoom}
            numColumns={2}
            onEndReached={loadMore}
            ListFooterComponent={loading && <ActivityIndicator size="large" />}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={{ justifyContent: "space-between" }}
        />
        </SafeAreaView>
    );
};

export default Home;