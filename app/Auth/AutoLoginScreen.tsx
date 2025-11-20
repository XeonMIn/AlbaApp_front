import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/userSlice";
import API from "@/api/axios";

export default function AutoLoginScreen() {
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();

    useEffect(() => {
        const run = async () => {
            try {
                const token = await SecureStore.getItemAsync("accessToken");
                if (!token) {
                    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
                    return;
                }

                // 토큰 명시 첨부(간헐적 레이스 방지)
                const res = await API.get("/member/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = res.data;

                const role = String(data.role ?? "").toUpperCase();
                const hasWorkplace = data.workplaceId !== null && data.workplaceId !== undefined;

                dispatch(
                    setUser({
                        id: data.id,
                        userId: data.userId,
                        name: data.name,
                        role,
                        email: data.email,
                        phoneNumber: data.phoneNumber,
                        accessToken: token,
                        workplaceId: hasWorkplace ? data.workplaceId : null,
                        workplaceName: hasWorkplace ? data.workplaceName : null,
                    } as any)
                );

                if ((role === "ALBA" || role === "EMPLOYEE") && hasWorkplace) {
                    navigation.reset({ index: 0, routes: [{ name: "EmployeeTabs" }] });
                } else if (role === "ALBA" || role === "EMPLOYEE") {
                    navigation.reset({ index: 0, routes: [{ name: "EmployeeNoWorkplace" }] });
                } else if (hasWorkplace) {
                    navigation.reset({ index: 0, routes: [{ name: "OwnerTabs" }] });
                } else {
                    navigation.reset({ index: 0, routes: [{ name: "OwnerEmpty" }] });
                }
            } catch (err) {
                // 만료/오류 → 토큰 삭제 후 로그인 화면
                try { await SecureStore.deleteItemAsync("accessToken"); } catch {}
                navigation.reset({ index: 0, routes: [{ name: "Login" }] });
            }
        };

        run();
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" />
        </View>
    );
}
