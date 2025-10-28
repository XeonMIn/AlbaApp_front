import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TaskScreen() {
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
            <View style={s.header}>
                <Text style={s.title}>오늘의 업무</Text>
            </View>

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
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    title: { fontSize: 20, fontWeight: "bold" },
    content: { padding: 16 },
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
    },
    taskTitle: { fontSize: 16, fontWeight: "bold" },
    taskDesc: { fontSize: 13, color: "#555" },
    emptyText: { textAlign: "center", color: "#999", marginTop: 20 },
});
