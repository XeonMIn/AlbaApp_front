import { Tabs } from "expo-router";

export default function OwnerLayout() {
    return (
        <Tabs>
            <Tabs.Screen name="home" options={{ title: "홈" }} />
            <Tabs.Screen name="schedule" options={{ title: "근무 스케줄" }} />
            <Tabs.Screen name="employees" options={{ title: "알바생 관리" }} />
            <Tabs.Screen name="notice" options={{ title: "공지사항" }} />
        </Tabs>
    );
}
