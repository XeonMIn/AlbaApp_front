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

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            {/* 로그인 & 회원가입 */}
            <Stack.Screen name="Login" component={LoginScreen}/>
            <Stack.Screen name="Register" component={RegisterScreen}/>

            {/* 아이디 찾기 */}
            <Stack.Screen name="FindId" component={FindIdScreen}/>
            <Stack.Screen name="FindIdResult" component={FindIdResultScreen}/>

            {/* 비밀번호 찾기 */}
            <Stack.Screen name="FindPassword" component={FindPasswordScreen}/>
            <Stack.Screen name="FindPasswordResult" component={FindPasswordResultScreen}/>
            <Stack.Screen name="FindAccount" component={FindAccountScreen}/>
        </Stack.Navigator>
    );
}
