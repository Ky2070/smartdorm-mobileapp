import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Image, Button, ActivityIndicator, Alert } from 'react-native';
import Apis, { endpoints, authApis } from '../../configs/Apis';
import { MyUserContext } from '../../configs/MyContexts';
import MyStyles from '../../styles/MyStyles';

const RoomDetails = ({ route, navigation }) => {
    const { RoomId } = route.params;
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = useContext(MyUserContext); // Lấy user từ context

    useEffect(() => {
        const loadRoom = async () => {
            try {
                let res = await Apis.get(`${endpoints['rooms']}${RoomId}/`);
                setRoom(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadRoom();
    }, []);

    const handleBooking = async () => {
        if (!user || !user.access_token) {
            Alert.alert("Chưa đăng nhập", "Bạn cần đăng nhập để đăng ký phòng.", [
                { text: "Hủy" },
                { text: "Đăng nhập", onPress: () => navigation.navigate("Login") }
            ]);
            return;
        }

        try {
            const api = authApis(user.access_token);

            // Gọi API đăng ký phòng
            let res = await api.post(endpoints['register-room'], {
                room: room.id,
            });

            Alert.alert("Thành công", "Bạn đã đăng ký phòng thành công!");
        } catch (err) {
            console.error(err.response?.data || err.message);
            Alert.alert("Lỗi", "Không thể đăng ký phòng. Vui lòng thử lại.");
        }
    };

    if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

    return (
        <View style={[MyStyles.container, MyStyles.p]}>
            <Image source={{ uri: room.image }} style={{ width: '100%', height: 200, borderRadius: 10 }} />
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 10 }}>{room.name}</Text>
            <Text>{room.description}</Text>
            <Text>Trạng thái: {room.available ? "Còn trống" : "Đã đặt"}</Text>

            {room.available && (
                <Button title="Đăng ký phòng" onPress={handleBooking} />
            )}
        </View>
    );
};

export default RoomDetails;
