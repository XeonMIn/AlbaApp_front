import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// 알바생 관련 화면들
import EmployeeHomeScreen from "../screens/Employee/EmployeeHomeScreen";
import ScheduleScreen from "../screens/Employee/ScheduleScreen";
import ChatScreen from "../screens/Employee/ChatScreen";
import ProfileScreen from "../screens/Employee/ProfileScreen";

const Tab = createBottomTabNavigator();

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

                    if (route.name === "EmployeeHome") {
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
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "bold",
                },
            })}
        >
            <Tab.Screen
                name="EmployeeHome"
                component={EmployeeHomeScreen}
                options={{ tabBarLabel: "홈" }}
            />
            <Tab.Screen
                name="Schedule"
                component={ScheduleScreen}
                options={{ tabBarLabel: "일정" }}
            />
            <Tab.Screen
                name="Chat"
                component={ChatScreen}
                options={{ tabBarLabel: "채팅" }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ tabBarLabel: "내 정보" }}
            />
        </Tab.Navigator>
    );
}
