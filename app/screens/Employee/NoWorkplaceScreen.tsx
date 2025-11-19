import React from "react";
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NoWorkplaceScreen({ navigation }: any) {
    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            // 스택이 없을 때를 대비한 fallback
            navigation.navigate("Login");
        }
    };

    return (
        <SafeAreaView style={s.container}>
            {/* 상단 헤더 */}
            <View style={s.header}>
                <TouchableOpacity onPress={handleBack}>
                    <Ionicons name="chevron-back" size={26} color="#111" />
                </TouchableOpacity>
                <Text style={s.title}>매장 정보</Text>
                {/* 오른쪽 아이콘 자리를 맞추기 위한 더미 뷰 */}
                <View style={{ width: 26 }} />
            </View>

            {/* 본문 영역 */}
            <View style={s.content}>
                <Text style={s.message}>현재 등록된 매장이 없어요</Text>
                <Pressable
                    style={s.button}
                    onPress={() => navigation.navigate("WorkplaceJoin")}
                >
                    <Text style={s.buttonText}>매장등록 요청</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        backgroundColor: "#fff",
        elevation: 2,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#111",
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
        backgroundColor: "#fff",
    },
    message: {
        fontSize: 16,
        color: "#111",
        marginBottom: 16,
    },
    button: {
        width: 240,
        height: 44,
        borderRadius: 8,
        backgroundColor: "#eef3fa",
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        fontSize: 16,
        color: "#111",
    },
});
