import { View, Text, StyleSheet } from "react-native";

export default function OwnerHome() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>사장님 홈</Text>
            <Text>근무 스케줄 관리, 알바생 관리, 공지사항 등록</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
});
