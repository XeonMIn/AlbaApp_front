import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

import { useNoticeTopic } from "@/app/utils/useNoticeTopic";
import { useTaskStream } from "@/app/utils/useTaskStream";
import { fetchAnnouncements, type AnnouncementDto } from "@/api/announcement.api";

import {
    fetchMyTasks,
    completeTask,
    uncompleteTask,
    type TaskAssignmentDto,
} from "@/api/task";

import { clockOutMe } from "@/api/attendance.api"; // ✅ 바뀐 부분: 안전한 퇴근 API

function parseDate(s?: string) {
    if (!s) return 0;
    return new Date(s.replace(" ", "T")).getTime() || 0;
}

// ✅ 공통 정렬: 미완료 먼저, 그 다음 이름순
function sortTasks(arr: TaskAssignmentDto[]) {
    return [...arr].sort((a, b) => {
        const sa = a.status === "DONE" ? 1 : 0;
        const sb = b.status === "DONE" ? 1 : 0;
        if (sa !== sb) return sa - sb;
        return (a.taskName ?? "").localeCompare(b.taskName ?? "", "ko");
    });
}

export default function EmployeeHomeScreen({ navigation }: any) {
    const user = useSelector((state: RootState) => state.user);

    const workplaceId: number | undefined = user.workplaceId ?? undefined;
    const memberId: number | undefined = user.id ?? undefined;
    const token: string | undefined = user.accessToken ?? undefined;

    const [history, setHistory] = useState<AnnouncementDto[]>([]);
    const { notices } = useNoticeTopic(workplaceId, token);

    // ✅ 실시간 업무 이벤트
    const { events } = useTaskStream(workplaceId, token);

    // ✅ 내 업무 목록 상태
    const [tasks, setTasks] = useState<TaskAssignmentDto[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(false);

    const [clockOutLoading, setClockOutLoading] = useState(false); // ✅ 퇴근 버튼 로딩 상태

    // 공지 초기 로드
    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!workplaceId) { setHistory([]); return; }
            try {
                const data = await fetchAnnouncements(workplaceId);
                if (!cancelled) setHistory(data);
            } catch { setHistory([]); }
        })();
        return () => { cancelled = true; };
    }, [workplaceId]);

    // ✅ 내 업무 로드
    const loadTasks = useCallback(async () => {
        if (!workplaceId || !memberId) return;
        setLoadingTasks(true);
        try {
            const data = await fetchMyTasks(workplaceId, memberId);
            setTasks(sortTasks(data ?? []));
        } catch (e: any) {
            console.warn(e);
            Alert.alert("오류", e?.message || "업무 목록을 불러오지 못했습니다.");
        } finally {
            setLoadingTasks(false);
        }
    }, [workplaceId, memberId]);

    useEffect(() => { loadTasks(); }, [loadTasks]);

    // ✅ 실시간 이벤트 들어오면 즉시 새로고침
    useEffect(() => {
        if (!events.length) return;
        loadTasks();
    }, [events, loadTasks]);

    // ✅ 완료/취소 토글
    const toggleTask = async (a: TaskAssignmentDto) => {
        const wasDone = a.status === "DONE";
        const nextStatus: TaskAssignmentDto["status"] = wasDone ? "ASSIGNED" : "DONE";
        const rollbackStatus: TaskAssignmentDto["status"] = a.status;

        setTasks(prev => {
            const updated = prev.map<TaskAssignmentDto>(x =>
                x.id === a.id ? { ...x, status: nextStatus } : x
            );
            return sortTasks(updated);
        });

        try {
            if (wasDone) await uncompleteTask(a.id, memberId!);
            else await completeTask(a.id, memberId!);
        } catch (e: any) {
            setTasks(prev => {
                const reverted = prev.map<TaskAssignmentDto>(x =>
                    x.id === a.id ? { ...x, status: rollbackStatus } : x
                );
                return sortTasks(reverted);
            });
            Alert.alert("오류", e?.message || "상태 변경 중 오류가 발생했습니다.");
        }
    };

    // ✅ 퇴근 버튼 핸들러 — workplaceId 없이 안전 처리
    const handleClockOut = async () => {
        if (clockOutLoading) return;

        if (!memberId) {
            Alert.alert("오류", "회원 정보가 없습니다.\n다시 로그인해 주세요.");
            return;
        }

        try {
            setClockOutLoading(true);

            const data = await clockOutMe(); // ← 포인트: workplaceId 미전달

            Alert.alert(
                "퇴근 완료",
                data?.message || "퇴근이 정상적으로 기록되었습니다."
            );

            // (선택) 퇴근 후 화면 갱신 필요시 여기서 처리

        } catch (e: any) {
            const msg =
                e?.response?.data?.message ||
                e?.message ||
                "퇴근 처리 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.";

            Alert.alert("퇴근 실패", msg);
        } finally {
            setClockOutLoading(false);
        }
    };

    // 방송 우선으로 병합 후 최신 3개
    const latest3 = useMemo(() => {
        const map = new Map<number | string, AnnouncementDto>();
        const key = (n: AnnouncementDto, i: number) => n.id ?? `${n.title}__${n.content}__${n.createdtime ?? ""}__${i}`;
        [...notices, ...history].forEach((n, i) => map.set(key(n, i), n));
        return Array.from(map.values())
            .sort((a, b) => parseDate(b.createdtime) - parseDate(a.createdtime))
            .slice(0, 3);
    }, [notices, history]);

    return (
        <SafeAreaView style={s.container}>
            {/* 상단 헤더 */}
            <View style={s.header}>
                <Text style={s.name}>{user.name ? `${user.name}님` : "알바생님"}</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Notice")}>
                    <Ionicons name="notifications-outline" size={26} color="#111" />
                </TouchableOpacity>
            </View>

            {/* 본문 */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* 급여 카드 */}
                <TouchableOpacity style={s.salaryCard} activeOpacity={0.8} onPress={() => navigation.navigate("PayList")}>
                    <Text style={s.salaryLabel}>이번 달 예상 급여</Text>
                    <Text style={s.salaryAmount}>₩ 512,900</Text>
                    <Text style={s.salarySub}>근무 42시간 · 시급 ₩12,000</Text>
                </TouchableOpacity>

                {/* 출퇴근 카드 */}
                <View style={s.attendanceCard}>
                    {/* QR 출근 */}
                    <TouchableOpacity
                        style={{ alignItems: "center" }}
                        onPress={() => navigation.navigate("QRScanner")}
                    >
                        <Ionicons name="qr-code-outline" size={40} color="#007AFF" />
                        <Text style={s.subText}>QR 출근</Text>
                    </TouchableOpacity>

                    <View style={s.verticalDivider} />

                    {/* 퇴근 버튼 */}
                    <TouchableOpacity
                        style={{ alignItems: "center" }}
                        onPress={handleClockOut}
                        disabled={clockOutLoading}
                    >
                        <Ionicons
                            name="walk-outline"
                            size={40}
                            color={clockOutLoading ? "#999" : "green"}
                        />
                        <Text
                            style={[
                                s.subText,
                                { color: clockOutLoading ? "#999" : "green" },
                            ]}
                        >
                            {clockOutLoading ? "처리 중..." : "퇴근하기"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* 오늘 일정 */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>📅 오늘 근무 일정</Text>
                    <TouchableOpacity style={s.card} onPress={() => navigation.navigate("Schedule")}>
                        <Text style={s.cardText}>10:00 ~ 18:00 (8시간)</Text>
                        <Text style={s.cardSub}>매장명: 스마트커피</Text>
                    </TouchableOpacity>
                </View>

                {/* ✅ 오늘의 업무 */}
                <View style={s.section}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={s.sectionTitle}>✅ 오늘의 업무</Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Tasks")}>
                            <Text style={{ color: "#007AFF", fontWeight: "600" }}>전체 보기</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={s.taskCard}>
                        {loadingTasks ? (
                            <Text style={{ color: "#777" }}>불러오는 중…</Text>
                        ) : tasks.length === 0 ? (
                            <Text style={{ color: "#777" }}>배정된 업무가 없습니다.</Text>
                        ) : (
                            tasks.map((t) => {
                                const done = t.status === "DONE";
                                const title = t.taskName || (t.taskId ? `업무 #${t.taskId}` : "업무");
                                return (
                                    <TouchableOpacity
                                        key={t.id}
                                        style={s.taskRow}
                                        onPress={() => toggleTask(t)}
                                        activeOpacity={0.6}
                                    >
                                        <Ionicons
                                            name={done ? "checkmark-circle" : "ellipse-outline"}
                                            size={20}
                                            color={done ? "#2ecc71" : "#999"}
                                        />
                                        <Text style={[s.taskItem, done && s.taskDone]} numberOfLines={1}>
                                            {title}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })
                        )}
                    </View>
                </View>

                {/* 📢 최근 공지사항 (최신 3개) */}
                <View style={s.section}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={s.sectionTitle}>📢 최근 공지사항</Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Notice")}>
                            <Text style={{ color: "#007AFF", fontWeight: "600" }}>전체 보기</Text>
                        </TouchableOpacity>
                    </View>

                    {latest3.length === 0 ? (
                        <Text style={{ color: "#777" }}>등록된 공지가 없습니다.</Text>
                    ) : (
                        latest3.map((n, idx) => (
                            <TouchableOpacity key={n.id ?? idx} style={s.noticeCard} onPress={() => navigation.navigate("Notice")}>
                                <Ionicons name="megaphone-outline" size={18} color="#007AFF" />
                                <Text style={s.noticeText} numberOfLines={1}>{n.title}</Text>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8f9fb" },
    header: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingHorizontal: 20, paddingVertical: 14, backgroundColor: "#fff", elevation: 3,
    },
    name: { fontSize: 22, fontWeight: "bold", color: "#111" },

    salaryCard: { margin: 16, borderRadius: 18, padding: 20, elevation: 3, backgroundColor: "#007AFF" },
    salaryLabel: { color: "#fff", fontSize: 14 },
    salaryAmount: { color: "#fff", fontSize: 32, fontWeight: "bold", marginTop: 6 },
    salarySub: { color: "#eef", fontSize: 13, marginTop: 4 },

    attendanceCard: {
        flexDirection: "row", justifyContent: "space-around", backgroundColor: "#fff",
        marginHorizontal: 16, padding: 20, borderRadius: 16, elevation: 2,
    },
    verticalDivider: { width: 1, backgroundColor: "#ddd", height: "100%" },

    section: { marginHorizontal: 16, marginTop: 20 },
    sectionTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 10 },

    card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, elevation: 2 },
    cardText: { fontSize: 15, fontWeight: "600" },
    cardSub: { color: "#555", marginTop: 4, fontSize: 13 },

    // 업무 카드
    taskCard: { backgroundColor: "#fff", borderRadius: 12, padding: 14, elevation: 2 },
    taskRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
    taskItem: { fontSize: 14, flexShrink: 1 },
    taskDone: { textDecorationLine: "line-through", color: "#999" },

    noticeCard: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#fff", borderRadius: 10, padding: 10, marginBottom: 8, elevation: 1,
    },
    noticeText: { marginLeft: 8, color: "#333", fontSize: 13 },
    subText: { marginTop: 4, fontSize: 13, color: "#333" },
});
