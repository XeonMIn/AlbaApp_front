import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { logout } from "@/store/userSlice";

export default function ProfileScreen({ navigation }: any) {
    const user = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logout());
        navigation.replace("Login");
    };

    return (
        <View style={s.container}>
            <View style={s.header}>
                <Text style={s.title}>내 정보</Text>
                <Ionicons name="settings-outline" size={22} color="#111" />
            </View>

            {/* 상단 프로필 영역 */}
            <View style={s.profileSection}>
                <Image
                    source={require("@/assets/default_profile.png")}
                    style={s.profileImage}
                />

                {user.isLoggedIn ? (
                    <View style={s.textBox}>
                        <Text style={s.userName}>{user.name}</Text>
                        <Text style={s.userSub}>아이디: {user.userId}</Text>
                        <Text style={s.userSub}>유형: {user.role}</Text>
                    </View>
                ) : (
                    <View style={s.textBox}>
                        <Text style={s.loginText}>로그인해주세요</Text>
                        <View style={s.loginRow}>
                            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                                <Text style={s.linkText}>로그인</Text>
                            </TouchableOpacity>
                            <Text> / </Text>
                            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                                <Text style={s.linkText}>회원가입</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>

            {/* 프로필 메뉴 영역 */}
            <View style={s.menuContainer}>
                <TouchableOpacity style={s.menuItem}>
                    <Ionicons name="person-circle-outline" size={20} color="#007AFF" />
                    <Text style={s.menuText}>프로필 관리</Text>
                </TouchableOpacity>

                <TouchableOpacity style={s.menuItem} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                    <Text style={[s.menuText, { color: "#FF3B30" }]}>로그아웃</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    title: { fontSize: 18, fontWeight: "bold", color: "#111" },
    profileSection: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f2f2f2",
    },
    profileImage: { width: 60, height: 60, borderRadius: 30, marginRight: 14 },
    textBox: { flex: 1 },
    userName: { fontSize: 18, fontWeight: "bold", color: "#111" },
    userSub: { fontSize: 14, color: "#555", marginTop: 2 },
    loginText: { fontSize: 16, fontWeight: "bold", color: "#111" },
    loginRow: { flexDirection: "row", marginTop: 4 },
    linkText: { color: "#007AFF", fontWeight: "bold" },
    menuContainer: { marginTop: 10 },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f2f2f2",
    },
    menuText: { fontSize: 16, marginLeft: 8 },
});
