import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

type RootStackParamList = {
    Login: undefined;
    OwnerEmptyWorkplace: undefined;
    RegisterWorkplace: undefined;
};

export default function OwnerEmptyWorkplaceScreen() {
    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* 뒤로가기 → 로그인 화면으로 강제 이동 */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() =>
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                    })
                }
            >
                <Ionicons name="chevron-back" size={28} color="#000" />
            </TouchableOpacity>

            <View style={styles.container}>
                <Text style={styles.message}>등록된 근무지가 없습니다.</Text>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('RegisterWorkplace')}
                >
                    <Ionicons name="add" size={60} color="#fff" />
                </TouchableOpacity>

                <Text style={styles.subText}>
                    근무지를 추가하려면 + 버튼을 눌러주세요.
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    backButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 24,
    },
    addButton: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        elevation: 5,
    },
    subText: {
        fontSize: 16,
        color: '#777',
    },
});
