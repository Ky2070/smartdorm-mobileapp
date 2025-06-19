import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Apis, { authApis, endpoints } from '../../configs/Apis';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import styles from './Styles/RoomSwapStyles';

const RoomSwapScreen = ({ navigation, route }) => {
  const { currentRoomId } = route.params;
  const [rooms, setRooms] = useState([]);
  const [nextPage, setNextPage] = useState(endpoints['rooms']);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [userGender, setUserGender] = useState(null);
  const [studentId, setStudentId] = useState(null);

  const loadUserGender = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const res = await authApis(token).get(endpoints['current-user']);
      setUserGender(res.data.gender); // "male" hoặc "female"
      setStudentId(res.data.id);
    } catch (err) {
      console.error(err);
    }
  };

  const loadRooms = async (url, append = false) => {
    try {
      const res = await Apis.get(url);
      const filteredRooms = res.data.results.filter(
        room =>
          room.id !== currentRoomId &&
          room.gender_restriction === userGender
      );
      setRooms(prev => (append ? [...prev, ...filteredRooms] : filteredRooms));
      setNextPage(res.data.next);
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', 'Không thể tải danh sách phòng.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreRooms = () => {
    if (nextPage && !loadingMore) {
      setLoadingMore(true);
      loadRooms(nextPage, true);
    }
  };

  const sendSwapRequest = async () => {
    if (!selectedRoomId) {
      Alert.alert('Thông báo', 'Vui lòng chọn phòng muốn chuyển đến.');
      return;
    }

    if(selectedRoomId.is_full){
      Alert.alert('Thông báo', 'Phòng đã đủ sinh viên.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert("Chưa đăng nhập", "Bạn cần đăng nhập để thực hiện thao tác này.");
        return;
      }
      const api = authApis(token);
      const payload = {
        student: studentId,
        current_room: currentRoomId,
        desired_room_id: selectedRoomId,
        reason: reason.trim() || undefined,
      };
      await api.post(endpoints['room-swap'], payload);
      console.log("Payload gửi yêu cầu đổi phòng:", payload);
      Alert.alert('Thành công', 'Yêu cầu đổi phòng đã được gửi.');
      navigation.goBack();
    } catch (err) {
      console.error(err.response?.data || err);
      Alert.alert('Lỗi', 'Không thể gửi yêu cầu đổi phòng.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await loadUserGender();
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (userGender) {
      loadRooms(endpoints['rooms']);
    }
  }, [userGender]);

  const renderRoomItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.roomItem,
        selectedRoomId === item.id && styles.selectedRoom,
      ]}
      onPress={() => setSelectedRoomId(item.id)}>
      {item.image && (
        <Image
          source={{ uri: item.image }}
          style={styles.roomImage}
          resizeMode="cover"
        />
      )}
      <View style={{ paddingTop: 8 }}>
        <Text style={styles.roomName}>{item.name}</Text>
        <View style={styles.infoRow}>
          <FontAwesome5 name={item.gender_restriction === 'male' ? 'male' : 'female'} size={20} color="#555" />
          <Text style={styles.infoText}>
            {item.gender_restriction === 'male' ? 'Phòng nam' : 'Phòng nữ'}
          </Text>
          <MaterialIcons name="people" size={20} color="#555" style={{ marginLeft: 20 }} />
          <Text style={styles.infoText}>
            {item.current_students}/{item.capacity} sinh viên
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#3498db" />;
  }

  return (
    <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}
        keyboardVerticalOffset={80}
    >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Chọn phòng muốn chuyển đến</Text>

        <FlatList
            data={rooms}
            keyExtractor={item => item.id.toString()}
            renderItem={renderRoomItem}
            ListEmptyComponent={<Text style={styles.emptyText}>Không có phòng trống phù hợp.</Text>}
            onEndReached={loadMoreRooms}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
            loadingMore && <ActivityIndicator size="small" color="#2980b9" />
            }
            scrollEnabled={false}
        />

        <Text style={styles.label}>Lý do (nếu có)</Text>
        <TextInput
            style={styles.input}
            placeholder="Nhập lý do chuyển phòng..."
            value={reason}
            onChangeText={setReason}
            multiline
            autoCorrect={true}
            autoCapitalize="sentences"
            keyboardType="default"
            textBreakStrategy="simple"
            scrollEnabled={false}
        />

        <TouchableOpacity style={styles.submitButton} onPress={sendSwapRequest}>
            <Text style={styles.submitButtonText}>Gửi yêu cầu đổi phòng</Text>
        </TouchableOpacity>
        </ScrollView>
    </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default RoomSwapScreen;
