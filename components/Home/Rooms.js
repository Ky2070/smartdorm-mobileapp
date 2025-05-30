// import { useContext, useEffect, useState } from 'react';
// import { View, Text, Image, ActivityIndicator, Alert } from 'react-native';
// import { MyUserContext } from '../../configs/MyContext';
// import { authApis, endpoints } from '../../configs/Apis';
// import MyStyles from '../../styles/MyStyles';

// const Rooms = () => {
//     const user = useContext(MyUserContext);
//     const [room, setRoom] = useState(null);
//     const [loading, setLoading] = useState(true);

//     const loadMyRoom = async () => {
//         if (!user || !user.access_token) {
//             Alert.alert("Lỗi", "Bạn cần đăng nhập để xem phòng của mình.");
//             return;
//         }

//         try {
//             const api = authApis(user.access_token);
//             const res = await api.get(endpoints['my-room']);
//             setRoom(res.data);
//         } catch (err) {
//             console.error(err);
//             Alert.alert("Lỗi", "Không thể tải thông tin phòng.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         loadMyRoom();
//     }, []);

//     if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

//     return (
//         <View style={[MyStyles.container, MyStyles.p]}>
//             {room ? (
//                 <>
//                     {room.image && (
//                         <Image
//                             source={{ uri: room.image }}
//                             style={{ width: '100%', height: 200, borderRadius: 10 }}
//                         />
//                     )}
//                     <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 10 }}>{room.name}</Text>
//                     {room.description && <Text>{room.description}</Text>}

//                     {/* Chỉ hiển thị nếu API có capacity và current_occupants */}
//                     {room.capacity !== undefined && room.current_occupants !== undefined ? (
//                         <Text>
//                             Trạng thái: {room.current_occupants < room.capacity ? "Phòng còn chỗ" : "Phòng đã đầy"} ({room.current_occupants}/{room.capacity})
//                         </Text>
//                     ) : (
//                         <Text>Trạng thái: {room.available ? "Còn trống" : "Đã có người ở"}</Text>
//                     )}
//                 </>
//             ) : (
//                 <Text>Bạn chưa đăng ký phòng nào.</Text>
//             )}
//         </View>
//     );
// };

// export default Rooms;
