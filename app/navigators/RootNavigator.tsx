import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// ----------------------------------------------------
// 인증 관련 화면
// ----------------------------------------------------
import LoginScreen from "../Auth/LoginScreen";
import RegisterScreen from "../Auth/RegisterScreen";
import FindIdScreen from "../Auth/FindIdScreen";
import FindIdResultScreen from "../Auth/FindIdResultScreen";
import FindPasswordScreen from "../Auth/FindPasswordScreen";
import FindPasswordResultScreen from "../Auth/FindPasswordResultScreen";
import FindAccountScreen from "@/app/Auth/FindAccountScreen";

// ----------------------------------------------------
// 홈 (탭 네비게이터)
// ----------------------------------------------------
import EmployeeTabNavigator from "../navigators/EmployeeTabNavigator";
import OwnerTabNavigator from "../navigators/OwnerTabNavigator";

// ----------------------------------------------------
// 개별 화면 (공통 및 추가 기능)
// ----------------------------------------------------
import TaskScreen from "../screens/Employee/TaskScreen";
import NoticeScreen from "../screens/Employee/NoticeScreen";
import EmployeeManageScreen from "../screens/Owner/EmployeeManageScreen";
import WorkplaceInfoScreen from "../screens/Owner/WorkplaceInfoScreen";
import OwnerTaskScreen from "../screens/Owner/OwnerTaskScreen";

// 급여 관련 화면
import { PayListScreen, PayDetailScreen, PayManageScreen } from "../screens/Pay";

// ----------------------------------------------------
// 네비게이션 타입 정의
// ----------------------------------------------------
export type RootStackParamList = {
    // 인증 관련
    Login: undefined;
    Register: undefined;
    FindId: undefined;
    FindIdResult: { userId: string };
    FindPassword: undefined;
    FindPasswordResult: { email: string };
    FindAccount: undefined;

    // 홈 (탭 네비게이터)
    EmployeeHome: undefined;
    OwnerHome: undefined;

    // 공통 화면
    Task: undefined;
    Notice: undefined;
    Chat: undefined;
    Profile: undefined;
    Schedule: undefined;

    // 사장님 전용 화면
    EmployeeManage: undefined;
    PayManage: undefined;
    WorkplaceInfo: undefined;
    OwnerTask: undefined;

    // 알바생 급여 관련
    PayList: undefined;
    PayDetail: { item: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// ----------------------------------------------------
//  루트 네비게이터
// ----------------------------------------------------
export default function RootNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* 로그인 & 회원가입 */}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />

            {/* 아이디 / 비밀번호 찾기 */}
            <Stack.Screen name="FindId" component={FindIdScreen} />
            <Stack.Screen name="FindIdResult" component={FindIdResultScreen} />
            <Stack.Screen name="FindPassword" component={FindPasswordScreen} />
            <Stack.Screen
                name="FindPasswordResult"
                component={FindPasswordResultScreen}
            />
            <Stack.Screen name="FindAccount" component={FindAccountScreen} />

            {/* 홈 (탭 네비게이터) */}
            <Stack.Screen name="EmployeeHome" component={EmployeeTabNavigator} />
            <Stack.Screen name="OwnerHome" component={OwnerTabNavigator} />

            {/* 공통 기능 */}
            <Stack.Screen name="Task" component={TaskScreen} />
            <Stack.Screen name="Notice" component={NoticeScreen} />

            {/* 사장님 전용 */}
            <Stack.Screen name="EmployeeManage" component={EmployeeManageScreen} />
            <Stack.Screen name="PayManage" component={PayManageScreen} />
            <Stack.Screen name="WorkplaceInfo" component={WorkplaceInfoScreen} />
            <Stack.Screen name="OwnerTask" component={OwnerTaskScreen} />

            {/* 알바생 급여 관련 */}
            <Stack.Screen name="PayList" component={PayListScreen} />
            <Stack.Screen name="PayDetail" component={PayDetailScreen} />
        </Stack.Navigator>
    );
}
