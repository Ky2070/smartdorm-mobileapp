import { useContext, useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, Alert } from 'react-native';
import { MyUserContext } from '../../configs/MyContexts';
import { authApis, endpoints } from '../../configs/Apis';
import MyStyles from '../../styles/MyStyles';
import AsyncStorage from "@react-native-async-storage/async-storage";
const Rooms = () => {
    const user = useContext(MyUserContext);
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);

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
            setRoom(res.data);
        } catch (err) {
            console.error(err);
            Alert.alert("Bạn hiện tại chưa đăng ký phòng nào.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log("Current user context:", user);
        loadMyRoom();
    }, []);

    if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

    return (
        <View style={[MyStyles.container, MyStyles.p]}>
            {room ? (
                <>
                    {room.image && (
                        <Image
                            source={{ uri: room.image }}
                            style={{ width: '100%', height: 200, borderRadius: 10 }}
                        />
                    )}
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 10 }}>{room.name}</Text>
                    {room.description && <Text>{room.description}</Text>}

                    {/* Chỉ hiển thị nếu API có capacity và current_students */}
                    {room.capacity !== undefined && room.current_students !== undefined ? (
                        <Text>
                            Trạng thái: {room.current_students < room.capacity ? "Phòng còn chỗ" : "Phòng đã đầy"} ({room.current_students}/{room.capacity})
                        </Text>
                    ) : (
                        <Text>Trạng thái: {room.is_full ? "Còn trống" : "Đã có người ở"}</Text>
                    )}
                </>
            ) : (
                <Text>Bạn chưa đăng ký phòng nào.</Text>
            )}
        </View>
    );
};

export default Rooms;
