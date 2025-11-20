import React, { useState, useCallback } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from "react-native";

type Props = { onSend: (text: string) => void };

export default function ChatComposer({ onSend }: Props) {
    const [text, setText] = useState("");

    const handleSend = useCallback(() => {
        const msg = text.trim();     // ✅ 전송 시에만 가공
        if (!msg) return;
        onSend(msg);
        setText("");                 // 전송 후 비우기
    }, [text, onSend]);

    return (
        <View style={s.wrap}>
            <TextInput
                style={s.input}
                value={text}
                onChangeText={setText}         // ✅ 입력중 가공 금지
                keyboardType="default"
                autoCapitalize="none"
                autoCorrect={false}
                multiline={false}
                blurOnSubmit={false}
                returnKeyType="send"
                // ❌ onSubmitEditing에서 또 보내지 마세요 (중복 방지)
            />
            <TouchableOpacity style={s.sendBtn} onPress={handleSend}>
                <Text style={s.sendTxt}>▶︎</Text>
            </TouchableOpacity>
        </View>
    );
}

const s = StyleSheet.create({
    wrap: { flexDirection: "row", alignItems: "center", padding: 8, gap: 8 },
    input: { flex: 1, backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
    sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "#6aa8ff" },
    sendTxt: { color: "#fff", fontWeight: "700" },
});
