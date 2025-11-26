// screens/ProfileScreen.tsx
import React, { useCallback, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { logout, setUser } from "@/store/userSlice";
import { useFocusEffect } from "@react-navigation/native";
import { fetchProfileById } from "@/api/member.api";

export default function ProfileScreen({ navigation }: any) {
    const user = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<any>(null);

    const load = useCallback(async () => {
        if (!user?.isLoggedIn || !user?.id) return;
        try {
            setLoading(true);
            const data = await fetchProfileById(user.id);
            setProfile(data);
            dispatch(
                setUser({
                    id: data.id,
                    userId: data.userId,
                    name: data.name,
                    role: String(data.role ?? ""),
                    email: data.email,
                    phoneNumber: data.phoneNumber,
                    accessToken: user.accessToken,
                    workplaceId: user.workplaceId,
                    workplaceName: user.workplaceName,
                } as any)
            );
        } catch (err: any) {
            console.error("프로필 조회 실패:", err?.message ?? err);
            if (!err?.response) {
                Alert.alert(
                    "프로필 조회 실패",
                    "네트워크 오류가 발생했어요.\n(실기기라면 서버 LAN IP, 같은 Wi-Fi인지 확인)"
                );
            }
        } finally {
            setLoading(false);
        }
    }, [dispatch, user?.id, user?.isLoggedIn, user?.accessToken, user?.workplaceId, user?.workplaceName]);

    useFocusEffect(
        useCallback(() => {
            load();
        }, [load])
    );

    const handleLogout = () => {
        dispatch(logout());
        navigation.replace("Login");
    };

    return (
        <SafeAreaView style={s.container}>
            {/* 헤더: 톱니바퀴 제거 */}
            <View style={s.header}>
                <Text style={s.title}>내 정보</Text>
            </View>

            {/* 프로필 영역 */}
            <View style={s.profileSection}>
                <Image source={require("@/assets/default_profile.png")} style={s.profileImage} />

                <View style={s.textBox}>
                    {loading ? (
                        <ActivityIndicator size="small" color="#000" />
                    ) : user.isLoggedIn && profile ? (
                        <>
                            <Text style={s.userName}>{profile.name}</Text>
                            <Text style={s.userSub}>아이디: {profile.userId}</Text>
                            <Text style={s.userSub}>이메일: {profile.email}</Text>
                            <Text style={s.userSub}>전화번호: {profile.phoneNumber}</Text>
                            <Text style={s.userSub}>
                                유형: {String(profile.role).toLowerCase() === "owner" ? "사장님" : "알바생"}
                            </Text>
                        </>
                    ) : (
                        <>
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
                        </>
                    )}
                </View>
            </View>

            {/* 메뉴 */}
            <View style={s.menuContainer}>
                <TouchableOpacity
                    style={s.menuItem}
                    onPress={() => navigation.navigate("ProfileEdit")}
                >
                    <Ionicons name="person-circle-outline" size={20} color="#007AFF" />
                    <Text style={s.menuText}>프로필 관리</Text>
                </TouchableOpacity>

                {user.isLoggedIn && (
                    <TouchableOpacity style={s.menuItem} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                        <Text style={[s.menuText, { color: "#FF3B30" }]}>로그아웃</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },

    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
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
