import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Screens
import OwnerHomeScreen from "../screens/Owner/OwnerHomeScreen";
import OwnerScheduleScreen from "../screens/Owner/OwnerScheduleScreen";
import OwnerNoticeScreen from "../screens/Owner/OwnerNoticeScreen";
import ProfileScreen from "../screens/Employee/ProfileScreen";

// ✅ 채팅은 스택 내비게이터(목록 → 방)로 교체
import ChatNavigator from "./ChatNavigator";

const Tab = createBottomTabNavigator();

export default function OwnerTabNavigator() {
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
                },
                tabBarIcon: ({ color, focused }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = "home";
                    if (route.name === "OwnerHome") iconName = focused ? "home" : "home-outline";
                    else if (route.name === "OwnerSchedule") iconName = focused ? "calendar" : "calendar-outline";
                    else if (route.name === "OwnerChat") iconName = focused ? "chatbubble" : "chatbubble-outline";
                    else if (route.name === "OwnerNotice") iconName = focused ? "megaphone" : "megaphone-outline";
                    else if (route.name === "Profile") iconName = focused ? "person" : "person-outline";
                    return <Ionicons name={iconName} size={22} color={color} />;
                },
                tabBarLabelStyle: { fontSize: 12, fontWeight: "bold" },
            })}
        >
            <Tab.Screen name="OwnerHome" component={OwnerHomeScreen} options={{ tabBarLabel: "홈" }} />
            <Tab.Screen name="OwnerSchedule" component={OwnerScheduleScreen} options={{ tabBarLabel: "일정" }} />
            {/* ✅ 채팅 탭을 ChatNavigator로 교체 */}
            <Tab.Screen name="OwnerChat" component={ChatNavigator} options={{ tabBarLabel: "채팅" }} />
            <Tab.Screen name="OwnerNotice" component={OwnerNoticeScreen} options={{ tabBarLabel: "공지" }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: "내 정보" }} />
        </Tab.Navigator>
    );
}
