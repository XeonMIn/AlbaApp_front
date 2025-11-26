import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import API from "@/api/axios";
import type { RootState } from "@/store/store";

export default function QRScannerScreen({ navigation }: any) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);
    const user = useSelector((s: RootState) => s.user);

    useEffect(() => { if (permission && !permission.granted) requestPermission(); }, [permission]);

    const handleScan = useCallback(async (res: BarcodeScanningResult) => {
        if (scanned) return;
        setScanned(true);
        setLoading(true);
        try {
            const data = typeof res?.data === "string" ? res.data : "";
            if (!data) throw new Error("잘못된 QR입니다.");
            if (!user?.userId) throw new Error("로그인이 필요합니다.");

            await API.post("/attendance/checkin", { userId: user.userId, qr: data });
            Alert.alert("출근 완료", "즐거운 하루 되세요!", [{ text: "확인", onPress: () => navigation.goBack() }]);
        } catch (e: any) {
            console.error(e);
            const msg = e?.response?.data?.message || e?.message || "출근 처리에 실패했습니다. 다시 시도해주세요.";
            Alert.alert("오류", msg, [{ text: "확인", onPress: () => setScanned(false) }]);
        } finally {
            setLoading(false);
        }
    }, [scanned, user?.userId]);

    if (!permission) return (<View style={s.center}><ActivityIndicator /></View>);

    if (!permission.granted) {
        return (
            <View style={s.center}>
                <Text style={s.permissionText}>카메라 권한이 필요합니다.</Text>
                <TouchableOpacity style={s.permissionButton} onPress={requestPermission}>
                    <Text style={s.permissionButtonText}>권한 허용</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={s.container}>
            <CameraView
                style={s.camera}
                onBarcodeScanned={scanned ? undefined : handleScan}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            />
            <View style={s.overlayTop} />
            <View style={s.middleRow}>
                <View style={s.overlaySide} />
                <View style={s.target} />
                <View style={s.overlaySide} />
            </View>
            <View style={s.overlayBottom}>
                <TouchableOpacity style={s.closeButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={26} color="#fff" />
                </TouchableOpacity>
            </View>
            {loading && <View style={s.loadingCover}><ActivityIndicator size="large" /></View>}
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    camera: { flex: 1 },
    overlayTop: { position: "absolute", top: 0, left: 0, right: 0, height: "20%", backgroundColor: "rgba(0,0,0,0.4)" },
    overlayBottom: { position: "absolute", bottom: 0, left: 0, right: 0, height: "25%", backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" },
    middleRow: { position: "absolute", top: "20%", height: "55%", left: 0, right: 0, flexDirection: "row", alignItems: "center", justifyContent: "center" },
    overlaySide: { width: "15%", height: "100%", backgroundColor: "rgba(0,0,0,0.4)" },
    target: { width: "70%", height: "100%", borderWidth: 2, borderColor: "#fff", borderRadius: 16 },
    closeButton: { backgroundColor: "rgba(0,0,0,0.6)", padding: 10, borderRadius: 50 },
    loadingCover: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.3)", alignItems: "center", justifyContent: "center" },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    permissionText: { fontSize: 16, marginBottom: 10, color: "#111" },
    permissionButton: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: "#007AFF", borderRadius: 8 },
    permissionButtonText: { color: "#fff", fontSize: 15 },
});
