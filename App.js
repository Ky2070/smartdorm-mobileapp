import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Icon } from "react-native-paper";
import { Provider as PaperProvider } from 'react-native-paper';
import { useContext, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MyUserReducer from "./reducers/MyUserReducer";
import { MyDispatchContext, MyUserContext } from "./configs/MyContexts";
import AdminPanel from "./components/Admin/AdminPanel";

import Home from "./components/Home/Home";
import RoomDetails from "./components/Home/RoomDetails";
import Rooms from "./components/Home/Rooms";
import Login from "./components/User/Login";
import Register from "./components/User/Register";
import Profile from "./components/User/Profile";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RoomManagementScreen from "./components/Admin/RoomManagementScreen";
import InvoiceManagementScreen from "./components/Admin/InvoiceManagementScreen";
import SupportRequestsScreen from "./components/Admin/SupportRequestsScreen";
import UpdateProfile from "./components/User/UpdateProfile";
import RoomSwap from "./components/Home/RoomSwap";
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import OnboardingScreen from "./components/Animation/OnboardingScreen";
import NotificationsScreen from "./components/Home/Notifications";
import TestNotificationScreen from "./components/Home/TestNotification";

import * as Notifications from 'expo-notifications';

const HomeStack = createNativeStackNavigator();
const HomeStackScreen = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen name="Home" component={Home} options={{ title: "Ký túc xá sinh viên" }} />
    <HomeStack.Screen name="RoomDetail" component={RoomDetails} options={{ title: "Chi tiết phòng" }} />
    <HomeStack.Screen name="UpdateProfile" component={UpdateProfile} options={{title: "Cập nhật thông tin"}} />
    <HomeStack.Screen name="Notifications" component={NotificationsScreen} options={{title: "Thông báo"}} />
    <HomeStack.Screen name="TestNotification" component={TestNotificationScreen} options={{ title: "Test Thông Báo" }} />
  </HomeStack.Navigator>
);

const AdminStack = createNativeStackNavigator();
const AdminStackScreen = () => (
  <AdminStack.Navigator>
    <AdminStack.Screen name="AdminPanel" component={AdminPanel} options={{title: "Bảng điều khiển"}}/>
    <AdminStack.Screen name="RoomManagement" component={RoomManagementScreen} options={{title: "Quản lý phòng ở"}}/>
    <AdminStack.Screen name="InvoiceManagement" component={InvoiceManagementScreen} options={{title: "Quản lý hóa đơn"}}/>
    <AdminStack.Screen
      name="SupportRequests"
      component={SupportRequestsScreen}
      options={{ title: "Yêu cầu hỗ trợ" }}
    />
  </AdminStack.Navigator>
);

const ProfileStack = createNativeStackNavigator();
const ProfileStackScreen = () => (
  <ProfileStack.Navigator>
    <ProfileStack.Screen name="ProfileMain" component={Profile} options={{ title: "Tài khoản" }} />
    <ProfileStack.Screen name="UpdateProfile" component={UpdateProfile} options={{ title: "Cập nhật hồ sơ" }} />
    <ProfileStack.Screen name="Rooms" component={Rooms} options={{title:"Phòng của tôi"}}/>
    <ProfileStack.Screen name="RoomSwap" component={RoomSwap} options={{title: "Đổi phòng"}} />
  </ProfileStack.Navigator>
);

const RoomStack = createNativeStackNavigator();
const RoomStackScreen = () => (
  <RoomStack.Navigator>
    <RoomStack.Screen name="Rooms" component={Rooms} options={{title: "Phòng của tôi"}} />
    <RoomStack.Screen name="RoomSwap" component={RoomSwap} options={{title: "Đổi phòng"}} />
  </RoomStack.Navigator>
)

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const user = useContext(MyUserContext);

  const isAdmin = user?.role === 'admin' || false; 
  const isStudent = user?.role === 'student' || false;
  const insets = useSafeAreaInsets(); 
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
      <Tab.Screen
        name="NotificationTest"
        component={TestNotificationScreen}
        options={{
          title: "Mẫu thông báo",
          tabBarIcon: ({ color }) => <Icon source="bell-ring" color={color} size={22} />,
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
              name="room"
              component={RoomStackScreen}
              options={{
                title: "Phòng của tôi",
                tabBarIcon: ({ color }) => <Icon source="door" color={color} size={22} />,
              }}
            />
          )}
          <Tab.Screen
            name="profile"
            component={ProfileStackScreen}
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


const RootStack = createNativeStackNavigator();

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      // const seen = await AsyncStorage.getItem('hasSeenOnboarding');
      setHasSeenOnboarding(false);
      setIsLoading(false);
    };
    checkOnboarding();
  }, []);

  // CẤU HÌNH THÔNG BÁO
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,        // Hiển thị thông báo
      shouldPlaySound: false,       // Không phát âm thanh
      shouldSetBadge: false,        // Không đặt biểu tượng badge
    }),
  });

  if (isLoading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
  <PaperProvider>
    <SafeAreaProvider>
      <MyUserContext.Provider value={user}>
        <MyDispatchContext.Provider value={dispatch}>
          <NavigationContainer>
            <RootStack.Navigator
              screenOptions={{ headerShown: false }}
              initialRouteName={hasSeenOnboarding ? "MainApp" : "Onboarding"}>
              <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
              <RootStack.Screen name="MainApp" component={TabNavigator} />
            </RootStack.Navigator>
          </NavigationContainer>
        </MyDispatchContext.Provider>
      </MyUserContext.Provider>
     </SafeAreaProvider>
  </PaperProvider>
  );
};

export default App;
