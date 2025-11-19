import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Pressable,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { updateUser } from "@/store/userSlice";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { updateProfile } from "@/api/profile.api";

export default function ProfileEditScreen({ navigation }: any) {
    const user = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch();

    const [name, setName] = useState(user.name || "");
    const [email, setEmail] = useState(user.email || "");
    const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");
    const [loading, setLoading] = useState(false);


    const handleSave = async () => {
        if (!user.id) {
            Alert.alert("오류", "회원 정보를 불러올 수 없습니다.");
            return;
        }

        try {
            setLoading(true);

            const res = await updateProfile(user.id, {
                name,
                email,
                phoneNumber,
            });

            Alert.alert("완료", "프로필이 수정되었습니다.");
            dispatch(updateUser({ name, email, phoneNumber }));
            navigation.goBack();
        } catch (err) {
            Alert.alert("서버 오류", "수정 요청 중 문제가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };



    return (
        <SafeAreaView style={s.container}>

            {/* 상단 헤더 */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#111" />
                </TouchableOpacity>

                <Text style={s.headerTitle}>프로필 수정</Text>

                {/* 오른쪽 빈 공간 (정렬 위해) */}
                <View style={{ width: 24 }} />
            </View>

            {/* 본문 */}
            <View style={s.content}>
                <TextInput
                    style={s.input}
                    placeholder="이름"
                    value={name}
                    onChangeText={setName}
                />

                <TextInput
                    style={s.input}
                    placeholder="이메일"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                />

                <TextInput
                    style={s.input}
                    placeholder="전화번호"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                />

                <Pressable
                    style={[s.button, loading && { opacity: 0.5 }]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={s.buttonText}>저장하기</Text>
                    )}
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
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        backgroundColor: "#fff",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#111",
    },
    content: {
        padding: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 14,
        backgroundColor: "#f7f7f7",
        marginBottom: 12,
    },
    button: {
        backgroundColor: "#007AFF",
        padding: 16,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});
