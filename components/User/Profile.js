import { useContext } from "react";
import { Text, View } from "react-native";
import { MyDispatchContext, MyUserContext } from "../../configs/MyContexts";
import MyStyles from "../../styles/MyStyles";
import { Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const Profile = () => {
    const user = useContext(MyUserContext);
    const dispatch = useContext(MyDispatchContext);
    const nav = useNavigation();

    const logout = () => {
        dispatch({
            "type": "logout"
        });

        nav.navigate("index");
    }

    return (
        <View>
            <Text style={MyStyles.subject}>Chào {user?.first_name} {user.last_name}!</Text>
            <Button mode="outlined" style={MyStyles.m} onPress={() => nav.navigate("Rooms")}>
                Phòng của tôi
            </Button>
            <Button onPress={logout} mode="contained">Đăng xuất</Button>
        </View>
    );
};

export default Profile;