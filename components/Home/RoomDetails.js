import React, { useEffect, useState, useContext } from 'react';
import {
    View, Text, Image, ActivityIndicator, Alert,
    StyleSheet, ScrollView, TouchableOpacity
} from 'react-native';
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
    const { width } = useWindowDimensions();

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

        if (!token) {
            Alert.alert("Chưa đăng nhập", "Bạn cần đăng nhập để đăng ký phòng.", [
                { text: "Hủy", style: "cancel" },
                { text: "Đăng nhập", onPress: () => navigation.navigate("login") }
            ]);
            return;
        }

        try {
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
    if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#2196F3" />;

    return (
        <ScrollView style={styles.container}>
            <Image source={{ uri: room?.image }} style={styles.image} />

            <View style={styles.card}>
                <Text style={styles.title}>{room?.name}</Text>

                <View style={styles.infoRow}>
                    <FontAwesome5 name={room.gender_restriction === 'male' ? 'male' : 'female'} size={20} color="#555" />
                    <Text style={styles.infoText}>
                        {room.gender_restriction === 'male' ? 'Phòng nam' : 'Phòng nữ'}
                    </Text>

                    <MaterialIcons name="people" size={20} color="#555" style={{ marginLeft: 20 }} />
                    <Text style={styles.infoText}>
                        {room.current_students}/{room.capacity} SV
                    </Text>
                </View>

                <View style={styles.descriptionBox}>
                    <Text style={styles.descriptionTitle}>📋 Mô tả phòng</Text>
                    <RenderHTML
                        contentWidth={width}
                        source={{ html: room?.description || "<p>Không có mô tả</p>" }}
                    />
                </View>

                <TouchableOpacity
                    style={[
                        styles.button,
                        { backgroundColor: room.available_capacity > 0 ? "#2196F3" : "#ccc" }
                    ]}
                    onPress={handleBooking}
                    disabled={room.available_capacity <= 0}
                >
                    <Text style={styles.buttonText}>
                        {room.available_capacity > 0 ? "📥 Đăng ký phòng" : "❌ Phòng đã đầy"}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f2f2f2',
    },
    image: {
        width: '100%',
        height: 220,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    card: {
        backgroundColor: '#fff',
        margin: 16,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 16,
        marginLeft: 6,
        color: '#555',
    },
    descriptionBox: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 10,
        marginTop: 10,
    },
    descriptionTitle: {
        fontWeight: '600',
        fontSize: 16,
        marginBottom: 6,
    },
    button: {
        marginTop: 20,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    }
});

export default RoomDetails;
