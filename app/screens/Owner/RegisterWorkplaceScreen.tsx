import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/store/userSlice";
import { RootState } from "@/store/store";
import API from "@/api/axios";

type RootStackParamList = {
    OwnerEmptyWorkplace: undefined;
    RegisterWorkplace: undefined;
    OwnerTabs: undefined; // ✅ 사장 탭 네비게이터
};

interface WorkplaceForm {
    name: string;
    address: string;
    businessnumber: string;
    businesshour: string;
    contactphoneNumber: string;
}

export default function RegisterWorkplaceScreen() {
    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const dispatch = useDispatch();
    // 기존 토큰/유저 정보 유지용 (setUser 호출 시 accessToken이 지워지지 않게)
    const currentUser = useSelector((state: RootState) => state.user);

    const [workplace, setWorkplace] = useState<WorkplaceForm>({
        name: "",
        address: "",
        businessnumber: "",
        businesshour: "",
        contactphoneNumber: "",
    });

    const handleChange = (key: keyof WorkplaceForm, value: string) => {
        setWorkplace((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        if (
            !workplace.name.trim() ||
            !workplace.address.trim() ||
            !workplace.businessnumber.trim() ||
            !workplace.businesshour.trim() ||
            !workplace.contactphoneNumber.trim()
        ) {
            Alert.alert("입력 오류", "모든 항목을 입력해주세요.");
            return;
        }

        try {
            // 1) 매장 등록
            await API.post("/workplace/add", workplace);

            // 2) 등록 직후 내 정보 재조회 → workplaceId / workplaceName 즉시 반영
            const meRes = await API.get("/member/me");
            const data = meRes.data;

            const upperRole = (data.role ?? "").toString().toUpperCase();

            // 🔥 Redux 업데이트: accessToken은 기존 값 유지(또는 currentUser.accessToken로 보존)
            dispatch(
                setUser({
                    id: data.id,
                    userId: data.userId,
                    name: data.name,
                    role: upperRole,
                    email: data.email,
                    phoneNumber: data.phoneNumber,
                    accessToken: currentUser.accessToken, // 기존 토큰 유지
                    workplaceId:
                        data.workplaceId !== undefined ? data.workplaceId : currentUser.workplaceId,
                    workplaceName:
                        data.workplaceName !== undefined ? data.workplaceName : currentUser.workplaceName,
                } as any)
            );

            // 3) 알림 후 사장 탭으로 리셋 (이미 Redux가 갱신되어 즉시 반영됨)
            Alert.alert("성공", "근무지가 등록되었습니다.", [
                {
                    text: "확인",
                    onPress: () =>
                        navigation.reset({
                            index: 0,
                            routes: [{ name: "OwnerTabs" }],
                        }),
                },
            ]);
        } catch (error: any) {
            console.log("근무지 등록 실패:", error?.response?.data || error.message);
            Alert.alert(
                "오류",
                error?.response?.data?.message ||
                "근무지 등록 중 문제가 발생했습니다."
            );
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* 상단 뒤로가기 버튼 */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="chevron-back" size={28} color="#000" />
            </TouchableOpacity>

            <View style={styles.container}>
                <Text style={styles.title}>근무지 등록</Text>

                <TextInput
                    style={styles.input}
                    placeholder="매장 이름"
                    value={workplace.name}
                    onChangeText={(v) => handleChange("name", v)}
                />

                <TextInput
                    style={styles.input}
                    placeholder="주소"
                    value={workplace.address}
                    onChangeText={(v) => handleChange("address", v)}
                />

                <TextInput
                    style={styles.input}
                    placeholder="사업자 번호"
                    value={workplace.businessnumber}
                    onChangeText={(v) => handleChange("businessnumber", v)}
                />

                <TextInput
                    style={styles.input}
                    placeholder="영업시간 (예: 09:00 ~ 18:00)"
                    value={workplace.businesshour}
                    onChangeText={(v) => handleChange("businesshour", v)}
                />

                <TextInput
                    style={styles.input}
                    placeholder="사업자 연락처"
                    keyboardType="phone-pad"
                    value={workplace.contactphoneNumber}
                    onChangeText={(v) => handleChange("contactphoneNumber", v)}
                />

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                >
                    <Text style={styles.submitText}>등록하기</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#fff",
    },
    backButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 20,
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
    },
    submitButton: {
        backgroundColor: "#007AFF",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    submitText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
