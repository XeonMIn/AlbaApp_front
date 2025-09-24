import { Tabs } from "expo-router";

export default function EmployeeLayout() {
    return (
        <Tabs>
            <Tabs.Screen name="home" options={{ title: "홈" }} />
            <Tabs.Screen name="attendance" options={{ title: "출퇴근" }} />
            <Tabs.Screen name="schedule" options={{ title: "스케줄" }} />
            <Tabs.Screen name="shift-request" options={{ title: "대타 요청" }} />
            <Tabs.Screen name="pay" options={{ title: "급여" }} />
        </Tabs>
    );
}
