import { Stack } from "expo-router";

export default function RootLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            {/* (auth) 그룹 */}
            <Stack.Screen name="(auth)" />
            {/* 사장님 그룹 */}
            <Stack.Screen name="(owner)" />
            {/* 알바생 그룹 */}
            <Stack.Screen name="(employee)" />
        </Stack>
    );
}
