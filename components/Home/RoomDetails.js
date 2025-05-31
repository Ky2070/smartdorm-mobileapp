import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Image, Button, ActivityIndicator, Alert } from 'react-native';
import Apis, { endpoints, authApis } from '../../configs/Apis';
import { MyUserContext } from '../../configs/MyContexts';
import MyStyles from '../../styles/MyStyles';
import AsyncStorage from "@react-native-async-storage/async-storage";
import RenderHTML from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';

const RoomDetails = ({ route, navigation }) => {
    const { RoomId } = route.params;
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = useContext(MyUserContext) || {};

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
    }, [RoomId]);

    const handleBooking = async () => {
            const token = await AsyncStorage.getItem("token");
            console.log(token);
            if (!token) {
                    Alert.alert("Chưa đăng nhập", "Bạn cần đăng nhập để đăng ký phòng.", [
                    { text: "Hủy", style: "cancel" },
                    { text: "Đăng nhập", onPress: () => navigation.navigate("login") }
                ]);
                return false;
            }

        try {
            const api = authApis(token);

            // 🔍 Kiểm tra xem user đã có phòng chưa
            let existingRoomRes = await api.get(endpoints['my-room']);
            if (existingRoomRes.data && existingRoomRes.data.id) {
                Alert.alert("Thông báo", "Bạn đã đăng ký phòng trước đó. Không thể đăng ký thêm.");
                return;
            }

            let res = await api.post(endpoints['register-room'], {
                room: room.id,
            });

            Alert.alert("Thành công", `Bạn đã đăng ký phòng: ${res.data}`);
        } catch (err) {
            if (err.response?.status === 400) {
                Alert.alert("Lỗi", "Bạn đã đăng ký phòng trước đó hoặc không đủ điều kiện.");
            } else {
                Alert.alert("Lỗi", "Không thể đăng ký phòng. Vui lòng thử lại.");
            }
        }
    };

    const {width} = useWindowDimensions();

    if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

    return (
        <View style={[MyStyles.container, MyStyles.p]}>
            <Image source={{ uri: room?.image }} style={{ width: '100%', height: 200, borderRadius: 10 }} />
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 10 }}>{room?.name}</Text>
            <RenderHTML
                contentWidth={width}
                source={{ html: room?.description || "<p>Không có mô tả</p>" }}
            />

            <Button
                title={room?.available_capacity > 0 ? "Đăng ký phòng" : "Phòng đã đầy"}
                onPress={handleBooking}
                disabled={room?.available_capacity <= 0}
                color={room?.available_capacity > 0 ? "#2196F3" : "#9E9E9E"}
            />
        </View>
    );
};

export default RoomDetails;
