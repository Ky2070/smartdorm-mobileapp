import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Icon } from "react-native-paper";
import { useContext, useReducer } from 'react';

import MyUserReducer from "./reducers/MyUserReducer";
import { MyDispatchContext, MyUserContext } from "./configs/MyContexts";
import AdminPanel from "./components/Admin/AdminPanel";
import UserManagementScreen from "./components/Admin/UserManagementScreen";
import Home from "./components/Home/Home";
import RoomDetails from "./components/Home/RoomDetails";
import Rooms from "./components/Home/Rooms";
import Login from "./components/User/Login";
import Register from "./components/User/Register";
import Profile from "./components/User/Profile";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RoomManagementScreen from "./components/Admin/RoomManagementScreen";

const HomeStack = createNativeStackNavigator();
const HomeStackScreen = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen name="Home" component={Home} options={{ title: "Ký túc xá sinh viên" }} />
    <HomeStack.Screen name="RoomDetail" component={RoomDetails} options={{ title: "Chi tiết phòng" }} />
  </HomeStack.Navigator>
);

const AdminStack = createNativeStackNavigator();
const AdminStackScreen = () => (
  <AdminStack.Navigator>
    <AdminStack.Screen name="AdminPanel" component={AdminPanel} options={{title: "Bảng điều khiển"}}/>
    <AdminStack.Screen name="UserManagement" component={UserManagementScreen} options={{title: "Quản lý người dùng"}}/>
    <AdminStack.Screen name="RoomManagement" component={RoomManagementScreen} options={{title: "Quản lý phòng ở"}}/>
  </AdminStack.Navigator>
);

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const user = useContext(MyUserContext);

  const isAdmin = user?.role === 'admin' || false; // hoặc user?.role === 'admin'
  const isStudent = user?.role === 'student' || false;
  const insets = useSafeAreaInsets(); // ✅ Thêm dòng này
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2e86de",
        tabBarLabelStyle: { fontSize: 13 },
         tabBarStyle: {
          paddingVertical: 4,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom || 6, 
        },
      }}
    >
      <Tab.Screen
        name="index"
        component={HomeStackScreen}
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color }) => <Icon source="home" color={color} size={22} />,
        }}
      />

      {user === null ? (
        <>
          <Tab.Screen
            name="login"
            component={Login}
            options={{
              title: "Đăng nhập",
              tabBarIcon: ({ color }) => <Icon source="login" color={color} size={22} />,
            }}
          />
        </>
      ) : (
        <>
          {isStudent && (
            <Tab.Screen
              name="Rooms"
              component={Rooms}
              options={{
                title: "Phòng của tôi",
                tabBarIcon: ({ color }) => <Icon source="door" color={color} size={22} />,
              }}
            />
          )}
          <Tab.Screen
            name="profile"
            component={Profile}
            options={{
              title: "Tài khoản",
              tabBarIcon: ({ color }) => <Icon source="account-circle" color={color} size={22} />,
            }}
          />
          {/* Quản trị viên sẽ thấy thêm mục này */}
          {isAdmin && (
              <>
              <Tab.Screen
                name="Admin"
                component={AdminStackScreen}
                options={{
                  title: "Quản trị",
                  tabBarIcon: ({ color }) => <Icon source="shield-account" color={color} size={22} />,
                }}
              />
              <Tab.Screen
              name="register"
              component={Register}
              options={{
                title: "Tạo tài khoản",
                tabBarIcon: ({ color }) => <Icon source="account-plus" color={color} size={22} />,
              }}
              />
            </>
          )}
        </>
      )}
    </Tab.Navigator>
  );
};

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  return (
    <SafeAreaProvider>
    <MyUserContext.Provider value={user}>
      <MyDispatchContext.Provider value={dispatch}>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </MyDispatchContext.Provider>
    </MyUserContext.Provider>
     </SafeAreaProvider>
  );
};

export default App;
