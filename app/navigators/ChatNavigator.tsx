// app/navigators/ChatNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChatRoomListScreen from "@/app/screens/Chat/ChatRoomListScreen";
import ChatRoomScreen from "@/app/screens/Chat/ChatRoomScreen";

export type ChatStackParam = {
    ChatRoomList: undefined;
    ChatRoom: { roomId: number | string; mode: "chat" | "notice" };
};

const Stack = createNativeStackNavigator<ChatStackParam>();

export default function ChatNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="ChatRoomList"
                component={ChatRoomListScreen}
                options={{ title: "채팅" }}
            />
            <Stack.Screen
                name="ChatRoom"
                component={ChatRoomScreen}
                options={{ title: "채팅방" }}
            />
        </Stack.Navigator>
    );
}
