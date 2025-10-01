import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigators/RootNavigator';

type RegisterScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'Register'
>;

export default function RegisterScreen() {
    const navigation = useNavigation<RegisterScreenNavigationProp>();

    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [businessLicense, setBusinessLicense] = useState(''); // 사장님 전용
    const [userType, setUserType] = useState<'owner' | 'employee'>('employee');

    const handleRegister = () => {
        if (!userId || !password || !confirmPassword || !email || !name || !phoneNumber) {
            return Alert.alert('입력 오류', '필수 항목을 모두 입력해주세요.');
        }
        if (password !== confirmPassword) {
            return Alert.alert('비밀번호 오류', '비밀번호가 일치하지 않습니다.');
        }

        Alert.alert(
            '회원가입 성공',
            `아이디: ${userId}\n이름: ${name}\n직책: ${userType === 'owner' ? '사장님' : '알바생'}`
        );

        navigation.replace('Login');
    };

    return (
        <ScrollView contentContainerStyle={s.container}>
            <Text style={s.title}>회원가입</Text>

            {/* 직책 선택 */}
            <View style={s.toggleContainer}>
                <TouchableOpacity
                    style={[s.toggleButton, userType === 'employee' && s.toggleActive]}
                    onPress={() => setUserType('employee')}
                >
                    <Text style={[s.toggleText, userType === 'employee' && s.toggleTextActive]}>
                        알바생
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[s.toggleButton, userType === 'owner' && s.toggleActive]}
                    onPress={() => setUserType('owner')}
                >
                    <Text style={[s.toggleText, userType === 'owner' && s.toggleTextActive]}>
                        사장님
                    </Text>
                </TouchableOpacity>
            </View>

            {/* 공통 입력 필드 */}
            <TextInput
                placeholder="아이디"
                style={s.input}
                value={userId}
                onChangeText={setUserId}
            />

            <TextInput
                placeholder="비밀번호"
                style={s.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TextInput
                placeholder="비밀번호 확인"
                style={s.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />

            <TextInput
                placeholder="이메일"
                style={s.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                placeholder="이름"
                style={s.input}
                value={name}
                onChangeText={setName}
            />

            <TextInput
                placeholder="전화번호"
                style={s.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
            />

            {/* 사장님 전용 입력 필드 */}
            {userType === 'owner' && (
                <TextInput
                    placeholder="사업자 등록번호"
                    style={s.input}
                    value={businessLicense}
                    onChangeText={setBusinessLicense}
                />
            )}

            {/* 회원가입 버튼 */}
            <TouchableOpacity style={s.button} onPress={handleRegister}>
                <Text style={s.buttonText}>회원가입</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={s.link}>로그인으로 돌아가기</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
        flexGrow: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16,
        paddingHorizontal: 10,
    },
    toggleContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    toggleButton: {
        flex: 1,
        padding: 12,
        borderWidth: 1,
        borderColor: '#111',
        borderRadius: 8,
        marginRight: 8,
        alignItems: 'center',
    },
    toggleActive: {
        backgroundColor: '#111',
    },
    toggleText: {
        color: '#111',
    },
    toggleTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#111',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    link: {
        marginTop: 16,
        textAlign: 'center',
        color: '#555',
    },
});
