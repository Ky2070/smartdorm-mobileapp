import AsyncStorage from "@react-native-async-storage/async-storage"

export default (current, action) => {
    switch(action.type) {
        case 'login':
            return action.payload;
        case 'logout':
            AsyncStorage.removeItem("token");
            AsyncStorage.removeItem("fcmToken");
            console.log("Xóa token và fcmToken thành công");
            return null;
    }
    return current;
}

