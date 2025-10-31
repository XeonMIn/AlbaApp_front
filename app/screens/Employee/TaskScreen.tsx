import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TaskScreen({ navigation }: any) {
    const [tasks, setTasks] = useState<any[]>([]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await axios.get("http://10.0.2.2:8081/api/task?employeeId=2"); // 로그인된 알바생 ID
                setTasks(res.data);
            } catch (e) {
                console.error(e);
            }
        };
        fetchTasks();
    }, []);

    return (
        <SafeAreaView style={s.container}>
            {/* ✅ 상단 헤더 */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={26} color="#111" />
                </TouchableOpacity>
                <Text style={s.title}>오늘의 업무</Text>
                <View style={{ width: 26 }} /> {/* 오른쪽 여백 균형 맞추기 */}
            </View>

            {/* ✅ 업무 리스트 */}
            <ScrollView contentContainerStyle={s.content}>
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <View key={task.id} style={s.card}>
                            <Ionicons name="checkmark-circle-outline" size={20} color="#007AFF" />
                            <View style={{ marginLeft: 8 }}>
                                <Text style={s.taskTitle}>{task.title}</Text>
                                <Text style={s.taskDesc}>{task.description}</Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={s.emptyText}>등록된 업무가 없습니다.</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 14,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        elevation: 3,
    },
    title: { fontSize: 20, fontWeight: "bold", color: "#111" },

    content: { padding: 16, paddingBottom: 100 },
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        elevation: 2,
    },
    taskTitle: { fontSize: 16, fontWeight: "bold", color: "#111" },
    taskDesc: { fontSize: 13, color: "#555", marginTop: 2 },
    emptyText: { textAlign: "center", color: "#999", marginTop: 20, fontSize: 15 },
});
