import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OwnerTaskScreen({ navigation }: any) {
    const [tasks, setTasks] = useState<{ id: number; title: string; desc: string }[]>([]);
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");

    const handleAddTask = () => {
        if (!title) return Alert.alert("입력 오류", "업무명을 입력해주세요.");
        const newTask = { id: Date.now(), title, desc };
        setTasks((prev) => [...prev, newTask]);
        setTitle("");
        setDesc("");
        Alert.alert("등록 완료", "업무가 추가되었습니다.");
    };

    const handleDelete = (id: number) => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <SafeAreaView style={s.container}>
            {/* 상단 헤더 */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={26} color="#111" />
                </TouchableOpacity>
                <Text style={s.title}>업무 관리</Text>
                <View style={{ width: 26 }} />
            </View>

            {/* 업무 입력 영역 */}
            <View style={s.inputBox}>
                <TextInput
                    style={s.input}
                    placeholder="업무명 입력"
                    value={title}
                    onChangeText={setTitle}
                />
                <TextInput
                    style={[s.input, { height: 70 }]}
                    placeholder="상세 내용 입력"
                    value={desc}
                    onChangeText={setDesc}
                    multiline
                />
                <TouchableOpacity style={s.button} onPress={handleAddTask}>
                    <Ionicons name="add-circle-outline" size={20} color="#fff" />
                    <Text style={s.buttonText}>업무 추가</Text>
                </TouchableOpacity>
            </View>

            {/* 등록된 업무 리스트 */}
            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={s.listContainer}
                renderItem={({ item }) => (
                    <View style={s.card}>
                        <View>
                            <Text style={s.cardTitle}>{item.title}</Text>
                            <Text style={s.cardDesc}>{item.desc}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleDelete(item.id)}>
                            <Ionicons name="trash-outline" size={22} color="#FF3B30" />
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={s.emptyText}>등록된 업무가 없습니다.</Text>
                }
            />
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        backgroundColor: "#fff",
        elevation: 3,
    },
    title: { fontSize: 18, fontWeight: "bold", color: "#111" },
    inputBox: { padding: 16 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    button: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#007AFF",
        padding: 12,
        borderRadius: 8,
    },
    buttonText: { color: "#fff", fontWeight: "bold", marginLeft: 6 },
    listContainer: { padding: 16 },
    card: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        elevation: 2,
    },
    cardTitle: { fontSize: 16, fontWeight: "bold", color: "#111" },
    cardDesc: { fontSize: 13, color: "#555", marginTop: 2 },
    emptyText: { textAlign: "center", color: "#999", marginTop: 20 },
});
