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
            await API.post("/workplace/add", workplace);

            Alert.alert("성공", "근무지가 등록되었습니다.", [
                {
                    text: "확인",
                    onPress: () =>
                        navigation.reset({
                            index: 0,
                            routes: [{ name: "OwnerTabs" }], // ✅ 사장 탭으로 스택 리셋
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
