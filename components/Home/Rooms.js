import { useContext, useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, Alert, StyleSheet, ScrollView } from 'react-native';
import { MyUserContext } from '../../configs/MyContexts';
import { authApis, endpoints } from '../../configs/Apis';
import MyStyles from '../../styles/MyStyles';
import AsyncStorage from "@react-native-async-storage/async-storage";
import RenderHTML from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const Rooms = () => {
    const user = useContext(MyUserContext);
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = "https://nquocky.pythonanywhere.com";

    const loadMyRoom = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            console.log(token);
            if (!token) {
                    Alert.alert("Chưa đăng nhập", "Bạn cần đăng nhập để đăng ký phòng.", [
                    { text: "Hủy", style: "cancel" },
                    { text: "Đăng nhập", onPress: () => navigation.navigate("login") }
                ]);
                return false;
            }
            const api = authApis(token);
            const res = await api.get(endpoints['my-room']);
            let roomData = res.data;
            // Nếu ảnh không có http(s), thêm tiền tố vào
            if (roomData.image && !roomData.image.startsWith("http")) {
                roomData.image = API_BASE_URL + roomData.image;
            }
            setRoom(res.data);
            console.log(roomData.image);
        } catch (err) {
            Alert.alert("Bạn hiện tại chưa đăng ký phòng nào.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log("Current user context:", user);
        loadMyRoom();
    }, []);

    const {width} = useWindowDimensions();
    if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

    return (
        <ScrollView style={[MyStyles.container]}>
            {room ? (
                <View style={styles.card}>
                    <Image source={{ uri: room?.image }} style={styles.image} />
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

                        <RenderHTML contentWidth={width} source={{ html: room?.description || "<p>Không có mô tả</p>" }} />
                    </View>
                </View>
            ) : (
                <View style={styles.noRoomContainer}>
                    <Text style={styles.noRoomText}>Bạn chưa đăng ký phòng nào.</Text>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    card: {
        margin: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 3,
        overflow: 'hidden'
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
