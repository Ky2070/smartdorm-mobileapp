import React, { useContext, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button, RadioButton } from 'react-native-paper';
import { MyUserContext, MyDispatchContext } from '../../configs/MyContexts';
import { authApis, endpoints } from '../../configs/Apis';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from './Styles/UpdateProfileStyles';

const UpdateProfile = () => {
  const user = useContext(MyUserContext);
  const dispatch = useContext(MyDispatchContext);
  const nav = useNavigation();

  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [gender, setGender] = useState(user?.gender || 'male');
  const [avatar, setAvatar] = useState(null);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("❌ Lỗi", "Bạn cần cấp quyền truy cập thư viện ảnh!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync();

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatar(result.assets[0]);
    }
  };
  console.log(user.username);
  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const api = authApis(token);
      const formData = new FormData();

      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('gender', gender);
      formData.append('email', email);

      if (avatar) {
        formData.append('avatar', {
          uri: avatar.uri,
          type: 'image/jpeg',
          name: 'avatar.jpg',
        });
      }

      const res = await api.patch(`/users/${user.id}/update-profile/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.status === 200) {
        Alert.alert('✅ Thành công', 'Hồ sơ đã được cập nhật.');

        const userRes = await api.get(endpoints['current-user']);
        dispatch({ type: 'login', payload: userRes.data });

        nav.goBack();
      }
    } catch (err) {
      console.error(err);
      Alert.alert('❌ Lỗi', 'Không thể cập nhật hồ sơ. Vui lòng thử lại.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          <Image
            source={
              avatar
                ? { uri: avatar.uri }
                : user?.avatar
                ? { uri: user.avatar }
                : require('../../assets/favicon.png') // ảnh mặc định
            }
            style={styles.avatar}
          />
          <Text style={{ textAlign: 'center', marginTop: 8, color: '#007AFF' }}>Thay ảnh đại diện</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Họ</Text>
        <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />

        <Text style={styles.label}>Tên</Text>
        <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />

        <Text style={styles.label}>Giới tính</Text>
        <RadioButton.Group onValueChange={setGender} value={gender}>
          <View style={styles.radioRow}>
            <RadioButton value="male" />
            <Text style={styles.radioLabel}>Nam</Text>
            <RadioButton value="female" />
            <Text style={styles.radioLabel}>Nữ</Text>
          </View>
        </RadioButton.Group>

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} />

        <Button
          mode="contained"
          onPress={handleUpdate}
          style={{ marginTop: 24, borderRadius: 24 }}
        >
          Cập nhật hồ sơ
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UpdateProfile;
