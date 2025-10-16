import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Auth Screens
import LoginScreen from "../Auth/LoginScreen";
import RegisterScreen from "../Auth/RegisterScreen";
import FindIdScreen from "../Auth/FindIdScreen";
import FindIdResultScreen from "../Auth/FindIdResultScreen";
import FindPasswordScreen from "../Auth/FindPasswordScreen";
import FindPasswordResultScreen from "../Auth/FindPasswordResultScreen";
import FindAccountScreen from "@/app/Auth/FindAccountScreen";

// Home Screens
import OwnerHomeScreen from "../screens/Owner/OwnerHomeScreen";

// 추가 스크린
import TaskScreen from "../screens/Employee/TaskScreen";
import NoticeScreen from "../screens/Employee/NoticeScreen";

// ✅ 새로 추가
import EmployeeTabNavigator from "../navigators/EmployeeTabNavigator";

export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    FindId: undefined;
    FindIdResult: { userId: string };
    FindPassword: undefined;
    FindPasswordResult: { email: string };
    FindAccount: undefined;
    EmployeeHome: undefined;
    OwnerHome: undefined;
    Task: undefined;
    Notice: undefined;
    Chat: undefined;
    Profile: undefined;
    Schedule: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* 로그인 & 회원가입 */}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />

            {/* 아이디/비밀번호 찾기 */}
            <Stack.Screen name="FindId" component={FindIdScreen} />
            <Stack.Screen name="FindIdResult" component={FindIdResultScreen} />
            <Stack.Screen name="FindPassword" component={FindPasswordScreen} />
            <Stack.Screen
                name="FindPasswordResult"
                component={FindPasswordResultScreen}
            />
            <Stack.Screen name="FindAccount" component={FindAccountScreen} />

            {/* 홈 (탭 네비게이터 연결) */}
            <Stack.Screen name="EmployeeHome" component={EmployeeTabNavigator} />
            <Stack.Screen name="OwnerHome" component={OwnerHomeScreen} />

            {/* 추가 화면 */}
            <Stack.Screen name="Task" component={TaskScreen} />
            <Stack.Screen name="Notice" component={NoticeScreen} />
        </Stack.Navigator>
    );
}
