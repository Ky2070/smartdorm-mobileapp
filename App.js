import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import MyUserReducer from "./reducers/MyUserReducer";
import Home from "./components/Home/Home";
import { Icon } from "react-native-paper";
import Rooms from "./components/Home/Rooms";
import RoomDetails from "./components/Home/RoomDetails";
import Login from "./components/User/Login";
import Register from "./components/User/Register";
import Profile from "./components/User/Profile";
import { useContext, useReducer } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MyDispatchContext, MyUserContext } from "./configs/MyContexts";

const Stack = createNativeStackNavigator();
const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="home" component={Home} options={{title: "Danh sách phòng KTX"}}/>
      {/* <Stack.Screen name="Rooms" component={Rooms} options={{title: "Phòng đang ở"}}/> */}
      <Stack.Screen name="RoomDetail" component={RoomDetails} options={{title: "Chi tiết phòng"}} />
    </Stack.Navigator>
  );
}
  // <Tab.Screen name="home" component={Home} options={{title: "Danh sách phòng KTX"}}/>
   
  // <Tab.Screen name="room-detail" component={RoomDetails} options={{title: "Chi tiết phòng"}} />
  //  <Tab.Screen name="room" component={Room} options={{title: "Phòng đang ở"}}/>
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const user = useContext(MyUserContext);

  return (
    <Tab.Navigator>
      <Tab.Screen name="index" component={StackNavigator} options={{title: "Ký túc xá sinh viên",tabBarIcon: () => <Icon source="home" size={20} />}}  />

      {user === null?<>
        <Tab.Screen name="login" component={Login} options={{title: "Đăng nhập",tabBarIcon: () => <Icon source="account" size={20} />}} />
        <Tab.Screen name="register" component={Register} options={{title: "Đăng ký", tabBarIcon: () => <Icon source="account-plus" size={20} />}} />
      </>:<>
        <Tab.Screen name="Rooms" component={Rooms} options={{title: "Phòng đang ở"}}/>
        <Tab.Screen name="profile" component={Profile} options={{title: "Tài khoản",tabBarIcon: () => <Icon source="account" size={20} />}} />
      </>}
      
    </Tab.Navigator>
  );
}
const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  return (
    <MyUserContext.Provider value={user}>
      <MyDispatchContext.Provider value={dispatch}>
        <NavigationContainer>
        
            <TabNavigator />
          
        </NavigationContainer>
      </MyDispatchContext.Provider>
    </MyUserContext.Provider>
  );
};

export default App;
