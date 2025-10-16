// app/screens/Employee/ProfileScreen.tsx
import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen({ navigation }: any) {
    const handleLogout = () => {
        Alert.alert("로그아웃", "정말 로그아웃하시겠습니까?", [
            { text: "취소", style: "cancel" },
            {
                text: "로그아웃",
                style: "destructive",
                onPress: () => navigation.replace("Login"),
            },
        ]);
    };

    const handleProfileEdit = () => {
        Alert.alert("프로필 관리", "프로필 수정 화면은 추후 추가 예정입니다.");
    };

    return (
        <SafeAreaView style={s.container}>
            {/* 상단 헤더 */}
            <View style={s.header}>
                <Text style={s.headerTitle}>내 정보</Text>
                <TouchableOpacity>
                    <Ionicons name="settings-outline" size={22} color="#111" />
                </TouchableOpacity>
            </View>

            {/* 프로필 영역 */}
            <View style={s.profileSection}>
                <Image
                    source={{ uri: "https://cdn-icons-png.flaticon.com/512/847/847969.png" }}
                    style={s.avatar}
                />
                <View style={{ marginLeft: 10 }}>
                    <Text style={s.loginText}>로그인해주세요</Text>
                    <TouchableOpacity onPress={() => navigation.replace("Login")}>
                        <Text style={s.loginButton}>로그인 / 회원가입</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 메뉴 리스트 */}
            <ScrollView style={s.menuContainer}>
                {/* 프로필 관리 */}
                <TouchableOpacity style={s.menuItem} onPress={handleProfileEdit}>
                    <Ionicons name="person-circle-outline" size={22} color="#007AFF" />
                    <Text style={s.menuText}>프로필 관리</Text>
                </TouchableOpacity>

                {/* 로그아웃 */}
                <TouchableOpacity style={s.menuItem} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={22} color="#ff3b30" />
                    <Text style={[s.menuText, { color: "#ff3b30" }]}>로그아웃</Text>
                </TouchableOpacity>
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
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        backgroundColor: "#fff",
        elevation: 2,
    },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#111" },

    profileSection: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#ddd",
    },
    loginText: { fontSize: 16, fontWeight: "bold", color: "#111" },
    loginButton: { color: "#007AFF", marginTop: 4, fontSize: 14 },

    menuContainer: { marginTop: 10 },

    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#f2f2f2",
    },
    menuText: { fontSize: 16, marginLeft: 12, color: "#111" },
});
