import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

type Message = {
    id: string;
    text: string;
    sender: "me" | "other";
    time: string;
};

export default function ChatScreen({ navigation }: any) {
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", text: "안녕하세요!", sender: "other", time: "09:00" },
        { id: "2", text: "안녕하세요 사장님!", sender: "me", time: "09:01" },
    ]);
    const [inputText, setInputText] = useState("");

    const handleSend = () => {
        if (!inputText.trim()) return;
        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: "me",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages([...messages, newMessage]);
        setInputText("");
    };

    const renderItem = ({ item }: { item: Message }) => (
        <View
            style={[
                s.messageContainer,
                item.sender === "me" ? s.myMessage : s.otherMessage,
            ]}
        >
            <Text style={s.messageText}>{item.text}</Text>
            <Text style={s.time}>{item.time}</Text>
        </View>
    );

    return (
        <SafeAreaView style={s.container}>
            {/* 상단 헤더 */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={26} color="#111" />
                </TouchableOpacity>
                <Text style={s.title}>💬 채팅</Text>
                <View style={{ width: 26 }} />
            </View>

            {/* 메시지 영역 */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={80}
            >
                <FlatList
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={s.chatArea}
                />

                {/* 입력창 */}
                <View style={s.inputContainer}>
                    <TextInput
                        style={s.input}
                        placeholder="메시지를 입력하세요"
                        value={inputText}
                        onChangeText={setInputText}
                    />
                    <TouchableOpacity onPress={handleSend} style={s.sendButton}>
                        <Ionicons name="send" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8f9fb" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        backgroundColor: "#fff",
        elevation: 2,
    },
    title: { fontSize: 18, fontWeight: "bold", color: "#111" },
    chatArea: { padding: 10, paddingBottom: 80 },
    messageContainer: {
        maxWidth: "75%",
        marginVertical: 6,
        padding: 10,
        borderRadius: 10,
    },
    myMessage: {
        alignSelf: "flex-end",
        backgroundColor: "#007AFF",
        borderBottomRightRadius: 0,
    },
    otherMessage: {
        alignSelf: "flex-start",
        backgroundColor: "#E5E5EA",
        borderBottomLeftRadius: 0,
    },
    messageText: { color: "#000", fontSize: 15 },
    time: { fontSize: 10, color: "#666", alignSelf: "flex-end", marginTop: 4 },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: "#ddd",
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginRight: 8,
        backgroundColor: "#f9f9f9",
    },
    sendButton: {
        backgroundColor: "#007AFF",
        borderRadius: 20,
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
    },
});
