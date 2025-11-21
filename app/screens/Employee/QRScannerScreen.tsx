import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";

export default function QRScannerScreen({ navigation }: any) {
    const [permission, requestPermission] = useCameraPermissions();

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

    const handleScan = ({ data }: any) => {
        Alert.alert("QR 스캔 완료", data);
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                onBarcodeScanned={handleScan}
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
