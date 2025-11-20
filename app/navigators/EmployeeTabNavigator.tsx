import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// 알바생 관련 화면들
import EmployeeHomeScreen from "../screens/Employee/EmployeeHomeScreen";
import ScheduleScreen from "../screens/Employee/ScheduleScreen";
import ProfileScreen from "../screens/Employee/ProfileScreen";

// ✅ 채팅은 스택 내비게이터(목록 → 방)로 교체
import ChatNavigator from "./ChatNavigator";

const Tab = createBottomTabNavigator();

/**
 * ⚙️ 변경 포인트(중복 경고 제거):
 * - 탭 내부의 홈 스크린 name을 "EmployeeHome" → "EmployeeHomeMain" 으로 유지
 * - 외부에서 "EmployeeHome"으로 네비게이션해도 컨테이너는 그대로라 동작 영향 없음
 */
export default function EmployeeTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: "#007AFF",
                tabBarInactiveTintColor: "#555",
                tabBarStyle: {
                    backgroundColor: "#fff",
                    borderTopWidth: 1,
                    borderTopColor: "#ddd",
                    height: 60,
                    paddingVertical: 6,
                },
                tabBarIcon: ({ color, focused }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = "home";
                    if (route.name === "EmployeeHomeMain") {
                        iconName = focused ? "home" : "home-outline";
                    } else if (route.name === "Schedule") {
                        iconName = focused ? "calendar" : "calendar-outline";
                    } else if (route.name === "Chat") {
                        iconName = focused ? "chatbubble" : "chatbubble-outline";
                    } else if (route.name === "Profile") {
                        iconName = focused ? "person" : "person-outline";
                    }
                    return <Ionicons name={iconName} size={22} color={color} />;
                },
                tabBarLabelStyle: { fontSize: 12, fontWeight: "bold" },
            })}
        >
            <Tab.Screen
                name="EmployeeHomeMain"
                component={EmployeeHomeScreen}
                options={{ tabBarLabel: "홈", title: "홈" }}
            />
            <Tab.Screen
                name="Schedule"
                component={ScheduleScreen}
                options={{ tabBarLabel: "일정", title: "일정" }}
            />
            {/* ✅ 채팅 탭을 ChatNavigator로 교체 */}
            <Tab.Screen
                name="Chat"
                component={ChatNavigator}
                options={{ tabBarLabel: "채팅", title: "채팅" }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ tabBarLabel: "내 정보", title: "내 정보" }}
            />
        </Tab.Navigator>
    );
}
