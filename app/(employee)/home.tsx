import { View, Text, StyleSheet } from "react-native";

export default function EmployeeHome() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>알바생 홈</Text>
            <Text>출근 기록, 대타 요청, 급여 확인</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
});
