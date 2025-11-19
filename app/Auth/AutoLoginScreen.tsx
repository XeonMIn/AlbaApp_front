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
        const checkToken = async () => {
            const token = await SecureStore.getItemAsync("accessToken");


            if (!token) {
                return navigation.replace("Login");
            }

            try {
                // /member/me 로 사용자 정보 조회 (필수)
                const res = await API.get("/member/me");
                console.log("자동 로그인 응답:", res.data);



                dispatch(
                    setUser({
                        id: res.data.id,
                        userId: res.data.userId,
                        name: res.data.name,
                        role: res.data.role,
                        accessToken: token,
                    })
                );

                if (res.data.role === "ALBA") {
                    navigation.replace("OwnerTabs");
                } else {
                    navigation.replace("EmployeeTabs");
                }


            } catch (err) {
                console.log("자동 로그인 실패:", err);
                navigation.replace("Login");
            }
        };

        checkToken();
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" />
        </View>
    );
}
