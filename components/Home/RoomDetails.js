import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Image, Button, ActivityIndicator, Alert, StyleSheet, ScrollView } from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
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
                console.log(res.data);
                console.log("Dữ liệu phòng:", res.data.id);
                console.log(await AsyncStorage.getItem("token"));
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

            // 🔍 Kiểm tra xem user đã có phòng chưa
            // let existingRoomRes = await authApis(token).get(endpoints['my-room']);
            // console.log(existingRoomRes.data.id);
            // if (existingRoomRes.data && existingRoomRes.data.id) {
            //     Alert.alert("Thông báo", "Bạn đã đăng ký phòng trước đó. Không thể đăng ký thêm.");
            //     return;
            // }
            
            let res = await authApis(token).post(endpoints['register-room'], {
                room: room.id
            });

            Alert.alert("Thành công", `Bạn đã đăng ký phòng: ${room.name}`);
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
        <ScrollView style={MyStyles.container}>
            <Image source={{ uri: room?.image }} style={styles.image} />

            <View style={styles.infoContainer}>
                <Text style={styles.title}>{room?.name}</Text>

                <View style={styles.metaInfo}>
                    <FontAwesome5 name={room.gender_restriction === 'male' ? 'male' : 'female'} size={20} color="#555" />
                    <Text style={styles.metaText}>
                        {room.gender_restriction === 'male' ? 'Nam' : 'Nữ'}
                    </Text>

                    <MaterialIcons name="people" size={20} color="#555" style={{ marginLeft: 16 }} />
                    <Text style={styles.metaText}>
                        {room.current_students}/{room.capacity} sinh viên
                    </Text>
                </View>

                <View style={{ marginTop: 10 }}>
                    <RenderHTML
                        contentWidth={width}
                        source={{ html: room?.description || "<p>Không có mô tả</p>" }}
                    />
                </View>
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    title={room?.available_capacity > 0 ? "📥 Đăng ký phòng" : "❌ Phòng đã đầy"}
                    onPress={handleBooking}
                    disabled={room?.available_capacity <= 0}
                    color={room?.available_capacity > 0 ? "#2196F3" : "#9E9E9E"}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: 220,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10
    },
    infoContainer: {
        padding: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    metaInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    metaText: {
        fontSize: 16,
        marginLeft: 4,
    },
    buttonContainer: {
        paddingHorizontal: 16,
        marginBottom: 20,
    },
});
export default RoomDetails;
