import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import API from "@/api/axios";

export default function QRScannerScreen({ navigation }: any) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false); // 여러 번 스캔 방지

    useEffect(() => {
        if (permission && !permission.granted) {
            requestPermission();
        }
    }, [permission]);

    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text style={styles.permissionText}>카메라 권한이 필요합니다.</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>권한 허용</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleScan = async ({ data }: any) => {
        if (scanned) return;        // 중복 스캔 막기
        setScanned(true);

        try {
            // ✅ 서버로 전송 (axios → API, userId 제거)
            await API.post("/attendance/checkin", {
                qrData: data,   // QR 안에 들어있는 문자열 서버로 전달
            });

            // 기존 기능 유지: 스캔된 값 보여주기
            Alert.alert("QR 스캔 완료", data);

            navigation.goBack();
        } catch (error) {
            console.error(error);
            Alert.alert("오류", "출근 처리에 실패했습니다. 다시 시도해주세요.");
            setScanned(false); // 실패하면 다시 스캔 가능하게
        }
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                onBarcodeScanned={scanned ? undefined : handleScan} // 한 번만 실행
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            />

            <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                <Ionicons name="close" size={32} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    camera: { flex: 1 },
    closeButton: {
        position: "absolute",
        top: 40,
        right: 20,
        backgroundColor: "rgba(0,0,0,0.6)",
        padding: 10,
        borderRadius: 50,
    },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    permissionText: { fontSize: 16, marginBottom: 10 },
    permissionButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: "#007AFF",
        borderRadius: 8,
    },
    permissionButtonText: { color: "#fff", fontSize: 15 },
});
