import React, { useEffect, useState, useContext } from 'react';
import {
    View, Text, Image, ActivityIndicator, Alert,
    StyleSheet, ScrollView, TouchableOpacity, Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import Apis, { endpoints, authApis } from '../../configs/Apis';
import { MyUserContext } from '../../configs/MyContexts';
import MyStyles from '../../styles/MyStyles';
import styles from './Styles/RoomDetailStyles';
import AsyncStorage from "@react-native-async-storage/async-storage";
import RenderHTML from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';

const RoomDetails = ({ route, navigation }) => {
    const { RoomId } = route.params;
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [packageMonths, setPackageMonths] = useState(1);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    
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

    useEffect(() => {
        const newEndDate = new Date(startDate);
        newEndDate.setMonth(startDate.getMonth() + parseInt(packageMonths));
        setEndDate(newEndDate);
    }, [packageMonths, startDate]);

    const handleBooking = async () => {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
            Alert.alert("Chưa đăng nhập", "Bạn cần đăng nhập để đăng ký phòng.", [
                { text: "Hủy", style: "cancel" },
                { text: "Đăng nhập", onPress: () => navigation.navigate("login") }
            ]);
            return;
        }
        if (user.gender && room.gender_restriction && user.gender !== room.gender_restriction){
            Alert.alert("Không đủ điều kiện",
                `${room.name} chỉ dành cho ${room.gender_restriction === 'male' ? 'nam' : 'nữ'}. Bạn không được đăng ký.`);
                return;
        }
        try {
            let res = await authApis(token).post(endpoints['register-room'], {
                room: room.id,
                start_date: startDate.toISOString().split("T")[0],
                end_date: endDate.toISOString().split("T")[0],
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

                 {/* GÓI ĐẶT - Picker */}
                <View style={{ marginTop: 20 }}>
                    <Text style={{ fontWeight: '600', marginBottom: 6 }}>🎯 Chọn gói thuê:</Text>
                    <View
                        style={{
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 8,
                            overflow: 'hidden',
                            backgroundColor: '#fff',
                        }}
                    >
                        <Picker
                            selectedValue={packageMonths}
                            onValueChange={(itemValue) => setPackageMonths(itemValue)}
                            mode="dropdown"
                            style={{ height: 50 }}
                        >
                            {[1, 3, 6, 12].map((month) => (
                                <Picker.Item key={month} label={`${month} tháng`} value={month} />
                            ))}
                        </Picker>
                    </View>
                </View>
                
                {/* DATE PICKERS */}
                <View style={{ marginTop: 16 }}>
                    <Text style={{ fontWeight: '600' }}>📅 Ngày bắt đầu:</Text>
                    <TouchableOpacity onPress={() => setShowStartPicker(true)}>
                        <Text style={styles.dateBox}>{startDate.toLocaleDateString()}</Text>
                    </TouchableOpacity>
                    {showStartPicker && (
                        <DateTimePicker
                            value={startDate}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowStartPicker(false);
                                if (selectedDate) setStartDate(selectedDate);
                            }}
                        />
                    )}

                    <Text style={{ fontWeight: '600', marginTop: 10 }}>📆 Ngày kết thúc:</Text>
                    <TouchableOpacity onPress={() => setShowEndPicker(true)}>
                        <Text style={styles.dateBox}>{endDate.toLocaleDateString()}</Text>
                    </TouchableOpacity>
                    {showEndPicker && (
                        <DateTimePicker
                            value={endDate}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowEndPicker(false);
                                if (selectedDate) setEndDate(selectedDate);
                            }}
                        />
                    )}
                </View>

                {/* BUTTON */}
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

export default RoomDetails;
