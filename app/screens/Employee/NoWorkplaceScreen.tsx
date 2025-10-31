import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export default function NoWorkplaceScreen({ navigation }: any) {
    return (
        <View style={s.container}>
            <Text style={s.message}>현재 등록된 매장이 없어요</Text>
            <Pressable style={s.button} onPress={() => navigation.navigate("WorkplaceJoin")}>
                <Text style={s.buttonText}>매장등록 요청</Text>
            </Pressable>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24, backgroundColor: "#fff" },
    message: { fontSize: 16, color: "#111", marginBottom: 16 },
    button: { width: 240, height: 44, borderRadius: 8, backgroundColor: "#eef3fa", alignItems: "center", justifyContent: "center" },
    buttonText: { fontSize: 16, color: "#111" },
});
