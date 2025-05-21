import MyStyles from "../../styles/MyStyles"
import { useContext, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyDispatchContext } from "../../configs/Contexts";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { Button, HelperText, TextInput } from "react-native-paper";
import Config from 'react-native-config';

const Login = () => {
    const info = [{
        label: 'Tên đăng nhập',
        field: 'username',
        icon: 'account',
        secureTextEntry: false
}, {
        label: 'Mật khẩu',
        field: 'password',
        icon: 'eye',
        secureTextEntry: true
    }];

    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState();
    const nav = useNavigation();
    const dispatch = useContext(MyDispatchContext);

    const setState = (value, field) => {
        setUser({...user, [field]: value})
    }

    const validate = () => {
        if (Object.values(user).length == 0){
            setMsg("Vui lòng nhập thông tin!");
            return false;
        }
        for (let i of info)
            if (user[i.field] === ''){
                setMsg (`Vui lòng nhập ${i.label}!`);
                return false;
            }

        setMsg('');
        return true;
    }

    const login = async () => {
        if (validate() === true){
            try {
                setLoading(true);
                
                let res = await Apis.post(endpoints['login'], {
                    ...user,
                    client_id: Config.CLIENT_ID,
                    client_secret: Config.CLIENT_SECRET,
                    grant_type: 'password'
                });
                await AsyncStorage.setItem('token', res.data.access_token);

                let u = await authApis(res.data.access_token).get(endpoints['current-user']);

                dispatch({
                    "type": "login",
                    "payload": u.data
                });
            } catch (ex) {
                console.error(ex);
            } finally {
                setLoading(false);
            }
        }
    }
    return (
        <ScrollView>
            <HelperText type="error" visible={msg}>
                {msg}
            </HelperText>
            
            {info.map(i =>  <TextInput key={i.field} style={MyStyles.m}
                                label={i.label}
                                secureTextEntry={i.secureTextEntry}
                                right={<TextInput.Icon icon={i.icon} />}
                                value={user[i.field]} onChangeText={t => setState(t, i.field)} />)}

          

            <Button onPress={login} disabled={loading} loading={loading} style={MyStyles.m} mode="contained">Đăng nhập</Button>
        </ScrollView>
    )
}

export default Login;