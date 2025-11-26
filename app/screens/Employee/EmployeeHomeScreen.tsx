import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

import { useNoticeTopic } from "@/app/utils/useNoticeTopic";
import { useTaskStream } from "@/app/utils/useTaskStream";
import { fetchAnnouncements, type AnnouncementDto } from "@/api/announcement.api";
import { getLatestPay, type LatestPay } from "@/api/pay.api";
import { fetchMyTasks, completeTask, uncompleteTask, type TaskAssignmentDto } from "@/api/task";
import { clockOutMe } from "@/api/attendance.api";

import { fetchShiftsByDate, type Shift } from "@/api/shift.api";
import { fetchMyEmployment } from "@/api/employment.api";

function parseDate(s?: string) {
    if (!s) return 0;
    return new Date(s.replace(" ", "T")).getTime() || 0;
}
function sortTasks(arr: TaskAssignmentDto[]) {
    return [...arr].sort((a, b) => {
        const sa = a.status === "DONE" ? 1 : 0;
        const sb = b.status === "DONE" ? 1 : 0;
        if (sa !== sb) return sa - sb;
        return (a.taskName ?? "").localeCompare(b.taskName ?? "", "ko");
    });
}
function todayYMD() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}
function hhmm(v?: string) {
    if (!v) return "";
    const m = v.match(/^(\d{2}):(\d{2})/);
    return m ? `${m[1]}:${m[2]}` : v;
}
function minutesBetween(start?: string, end?: string) {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return eh * 60 + em - (sh * 60 + sm);
}

export default function EmployeeHomeScreen({ navigation }: any) {
    const user = useSelector((state: RootState) => state.user);

    // workplaceId 숫자 보정
    const rawWpId = user.workplaceId as unknown;
    const workplaceId: number | undefined =
        typeof rawWpId === "string" ? Number(rawWpId) : (rawWpId as number | undefined);

    const memberId: number | undefined = user.id ?? undefined;
    const token: string | undefined = user.accessToken ?? undefined;

    const [history, setHistory] = useState<AnnouncementDto[]>([]);
    const { notices } = useNoticeTopic(workplaceId, token);
    const { events } = useTaskStream(workplaceId, token);

    const [tasks, setTasks] = useState<TaskAssignmentDto[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [clockOutLoading, setClockOutLoading] = useState(false);

    const [latestPay, setLatestPayState] = useState<LatestPay | null>(null);
    const [payLoading, setPayLoading] = useState(false);

    const [myEmploymentId, setMyEmploymentId] = useState<number | null>(null);
    const [myTodayShifts, setMyTodayShifts] = useState<Shift[]>([]);
    const [loadingMyShifts, setLoadingMyShifts] = useState(false);

    // 공지
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

    // 업무
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
    useEffect(() => { if (events.length) loadTasks(); }, [events, loadTasks]);

    // 급여
    useEffect(() => {
        if (!memberId) return;
        (async () => {
            try {
                setPayLoading(true);
                const pay = await getLatestPay(memberId, workplaceId);
                setLatestPayState(pay);
            } catch { setLatestPayState(null); }
            finally { setPayLoading(false); }
        })();
    }, [memberId, workplaceId]);

    // 내 employmentId
    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!workplaceId) { setMyEmploymentId(null); return; }
            try {
                const me = await fetchMyEmployment(workplaceId);
                if (!cancelled) setMyEmploymentId(me?.employmentId ?? null);
            } catch { if (!cancelled) setMyEmploymentId(null); }
        })();
        return () => { cancelled = true; };
    }, [workplaceId]);

    // 오늘 내 근무(Shift)
    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!workplaceId || !myEmploymentId) { setMyTodayShifts([]); return; }
            try {
                setLoadingMyShifts(true);
                const shifts = await fetchShiftsByDate(workplaceId, todayYMD());
                const mine = (shifts ?? []).filter(
                    s => Array.isArray(s.employmentIds) && s.employmentIds.includes(myEmploymentId)
                );
                if (!cancelled) setMyTodayShifts(mine);
            } catch { if (!cancelled) setMyTodayShifts([]); }
            finally { if (!cancelled) setLoadingMyShifts(false); }
        })();
        return () => { cancelled = true; };
    }, [workplaceId, myEmploymentId]);

    const toggleTask = async (a: TaskAssignmentDto) => {
        const wasDone = a.status === "DONE";
        const nextStatus: TaskAssignmentDto["status"] = wasDone ? "ASSIGNED" : "DONE";
        const rollbackStatus: TaskAssignmentDto["status"] = a.status;

        setTasks(prev => prev.map(x => (x.id === a.id ? { ...x, status: nextStatus } : x)));
        try {
            if (wasDone) await uncompleteTask(a.id, memberId!);
            else await completeTask(a.id, memberId!);
        } catch (e: any) {
            setTasks(prev => prev.map(x => (x.id === a.id ? { ...x, status: rollbackStatus } : x)));
            Alert.alert("오류", e?.message || "상태 변경 중 오류가 발생했습니다.");
        }
    };

    const handleClockOut = async () => {
        if (clockOutLoading) return;
        if (!memberId) {
            Alert.alert("오류", "회원 정보가 없습니다.\n다시 로그인해 주세요.");
            return;
        }
        try {
            setClockOutLoading(true);
            const data = await clockOutMe();
            Alert.alert("퇴근 완료", data?.message || "퇴근이 정상적으로 기록되었습니다.");
        } catch (e: any) {
            const msg = e?.response?.data?.message || e?.message || "퇴근 처리 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.";
            Alert.alert("퇴근 실패", msg);
        } finally {
            setClockOutLoading(false);
        }
    };

    const myTodayWorkText = useMemo(() => {
        if (loadingMyShifts) return "불러오는 중…";
        if (!myTodayShifts.length) return "등록된 일정이 없습니다.";
        const first = myTodayShifts
            .slice()
            .sort((a, b) => (a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0))[0];
        const mins = minutesBetween(first.startTime, first.endTime);
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        const dur = m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
        const base = `${hhmm(first.startTime)} ~ ${hhmm(first.endTime)} (${dur})`;
        return myTodayShifts.length > 1 ? `${base} · 외 ${myTodayShifts.length - 1}개` : base;
    }, [loadingMyShifts, myTodayShifts]);

    const latest3 = useMemo(() => {
        const map = new Map<number | string, AnnouncementDto>();
        const key = (n: AnnouncementDto, i: number) =>
            n.id ?? `${n.title}__${n.content}__${n.createdtime ?? ""}__${i}`;
        [...notices, ...history].forEach((n, i) => map.set(key(n, i), n));
        return Array.from(map.values())
            .sort((a, b) => parseDate(b.createdtime) - parseDate(a.createdtime))
            .slice(0, 3);
    }, [notices, history]);

    const payNet = latestPay?.net ?? latestPay?.finalPay ?? 0;
    const payHrs = latestPay?.workHours ?? latestPay?.totalHours ?? 0;
    const payWage = latestPay?.hourlyWage ?? latestPay?.wage ?? 0;

    return (
        <SafeAreaView style={s.container}>
            <View style={s.header}>
                <Text style={s.name}>{user.name ? `${user.name}님` : "알바생님"}</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Notice")}>
                    <Ionicons name="notifications-outline" size={26} color="#111" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <TouchableOpacity style={s.salaryCard} activeOpacity={0.8} onPress={() => navigation.navigate("PayDetailQuick")}>
                    <Text style={s.salaryLabel}>이번 달 예상 실지급액</Text>
                    <Text style={s.salaryAmount}>
                        {payLoading ? "불러오는 중..." : `₩ ${Number(payNet || 0).toLocaleString()}`}
                    </Text>
                    {!payLoading && (
                        <Text style={s.salarySub}>
                            근무 {Number(payHrs || 0)}시간 · 시급 ₩{Number(payWage || 0).toLocaleString()}
                        </Text>
                    )}
                </TouchableOpacity>

                <View style={s.attendanceCard}>
                    <TouchableOpacity style={{ alignItems: "center" }} onPress={() => navigation.navigate("QRScanner")}>
                        <Ionicons name="qr-code-outline" size={40} color="#007AFF" />
                        <Text style={s.subText}>QR 출근</Text>
                    </TouchableOpacity>
                    <View style={s.verticalDivider} />
                    <TouchableOpacity style={{ alignItems: "center" }} onPress={handleClockOut} disabled={clockOutLoading}>
                        <Ionicons name="walk-outline" size={40} color={clockOutLoading ? "#999" : "green"} />
                        <Text style={[s.subText, { color: clockOutLoading ? "#999" : "green" }]}>
                            {clockOutLoading ? "처리 중..." : "퇴근하기"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* 오늘 근무 일정 (알바) */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>📅 오늘 근무 일정</Text>
                    <TouchableOpacity style={s.card} onPress={() => navigation.navigate("Schedule")}>
                        <Text style={s.cardText}>{myTodayWorkText}</Text>
                        {/* 요청대로: 매장 ID 표시는 제거 */}
                    </TouchableOpacity>
                </View>

                {/* 오늘의 업무 */}
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
                                    <TouchableOpacity key={t.id} style={s.taskRow} onPress={() => toggleTask(t)} activeOpacity={0.6}>
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

                {/* 최근 공지 */}
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

    taskCard: { backgroundColor: "#fff", borderRadius: 12, padding: 14, elevation: 2 },
    taskRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
    taskItem: { fontSize: 14, flexShrink: 1 },
    taskDone: { textDecorationLine: "line-through", color: "#999" },

    noticeCard: {
        flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
        borderRadius: 10, padding: 10, marginBottom: 8, elevation: 1,
    },
    noticeText: { marginLeft: 8, color: "#333", fontSize: 13 },

    subText: { marginTop: 4, fontSize: 13, color: "#333" },
});
