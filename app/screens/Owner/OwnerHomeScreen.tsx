// app/screens/Owner/OwnerHomeScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import type { RootState } from "@/store/store";

import { getWorkplaceDetail, type WorkplaceResponse } from "@/api/workplace.api";
import { useNoticeTopic } from "@/app/utils/useNoticeTopic";
import { fetchAnnouncements, type AnnouncementDto } from "@/api/announcement.api";
import { getEmploymentCountByWorkplace, getEmploymentNameMapByWorkplace } from "@/api/employment.api";
import { getTodayCheckedInCount } from "@/api/attendance.api";
import { fetchShiftsByDate, type Shift } from "@/api/shift.api";

function parseDate(s?: string) {
    if (!s) return 0;
    return new Date(s.replace(" ", "T")).getTime() || 0;
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

export default function OwnerHomeScreen({ navigation }: any) {
    const user = useSelector((state: RootState) => state.user);
    const isFocused = useIsFocused();

    // workplaceId 숫자 보정
    const rawWpId = user.workplaceId as unknown;
    const workplaceId: number | undefined =
        typeof rawWpId === "string" ? Number(rawWpId) : (rawWpId as number | undefined);
    const token: string | undefined = user.accessToken ?? undefined;

    // 대표 매장
    const [repWp, setRepWp] = useState<Pick<WorkplaceResponse, "name" | "address"> | null>(null);
    const [loadingRep, setLoadingRep] = useState(false);

    // 직원/출근
    const [empCount, setEmpCount] = useState(0);
    const [loadingEmpCount, setLoadingEmpCount] = useState(false);
    const [checkedInCount, setCheckedInCount] = useState(0);
    const [loadingCheckedIn, setLoadingCheckedIn] = useState(false);

    // 공지
    const [history, setHistory] = useState<AnnouncementDto[]>([]);
    const { notices } = useNoticeTopic(workplaceId, token);

    // 오늘 근무(Shift)
    const [todayShifts, setTodayShifts] = useState<Shift[]>([]);
    const [loadingShifts, setLoadingShifts] = useState(false);

    // employmentId → 이름 맵
    const [nameMap, setNameMap] = useState<Record<number, string>>({});
    const [loadingNames, setLoadingNames] = useState(false);

    // 대표 매장 로드
    useEffect(() => {
        const run = async () => {
            if (!workplaceId) { setRepWp(null); return; }
            try {
                setLoadingRep(true);
                const w = await getWorkplaceDetail(workplaceId);
                setRepWp({ name: w.name, address: w.address });
            } catch { setRepWp(null); }
            finally { setLoadingRep(false); }
        };
        run();
    }, [workplaceId, isFocused]);

    // 직원 수
    useEffect(() => {
        let canceled = false;
        (async () => {
            if (!workplaceId) { setEmpCount(0); return; }
            try {
                setLoadingEmpCount(true);
                const n = await getEmploymentCountByWorkplace(workplaceId);
                if (!canceled) setEmpCount(n ?? 0);
            } catch { if (!canceled) setEmpCount(0); }
            finally { if (!canceled) setLoadingEmpCount(false); }
        })();
        return () => { canceled = true; };
    }, [workplaceId, isFocused]);

    // 출근 인원
    useEffect(() => {
        let canceled = false;
        (async () => {
            if (!workplaceId) { setCheckedInCount(0); return; }
            try {
                setLoadingCheckedIn(true);
                const c = await getTodayCheckedInCount(workplaceId);
                if (!canceled) setCheckedInCount(c ?? 0);
            } catch { if (!canceled) setCheckedInCount(0); }
            finally { if (!canceled) setLoadingCheckedIn(false); }
        })();
        return () => { canceled = true; };
    }, [workplaceId, isFocused]);

    // 공지 로드
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
    }, [workplaceId, isFocused]);

    const latest3 = useMemo(() => {
        const map = new Map<number | string, AnnouncementDto>();
        const key = (n: AnnouncementDto, i: number) =>
            n.id ?? `${n.title}__${n.content}__${n.createdtime ?? ""}__${i}`;
        [...notices, ...history].forEach((n, i) => map.set(key(n, i), n));
        return Array.from(map.values())
            .sort((a, b) => parseDate(b.createdtime) - parseDate(a.createdtime))
            .slice(0, 3);
    }, [notices, history]);

    // 오늘 근무(Shift)
    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!workplaceId) { setTodayShifts([]); return; }
            try {
                setLoadingShifts(true);
                const data = await fetchShiftsByDate(workplaceId, todayYMD());
                if (!cancelled) setTodayShifts(data ?? []);
            } catch { if (!cancelled) setTodayShifts([]); }
            finally { if (!cancelled) setLoadingShifts(false); }
        })();
        return () => { cancelled = true; };
    }, [workplaceId, isFocused]);

    // 이름 맵 로드
    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!workplaceId) { setNameMap({}); return; }
            try {
                setLoadingNames(true);
                const m = await getEmploymentNameMapByWorkplace(workplaceId);
                if (!cancelled) setNameMap(m);
            } catch {
                if (!cancelled) setNameMap({});
            } finally {
                if (!cancelled) setLoadingNames(false);
            }
        })();
        return () => { cancelled = true; };
    }, [workplaceId]);

    // 표시에 쓸 라인: "HH:mm ~ HH:mm   이름1, 이름2"
    const ownerShiftLines = useMemo(() => {
        return (todayShifts ?? [])
            .slice()
            .sort((a, b) => {
                if (a.startTime !== b.startTime) return a.startTime < b.startTime ? -1 : 1;
                return a.endTime < b.endTime ? -1 : a.endTime > b.endTime ? 1 : 0;
            })
            .map((s, idx) => {
                const names = (Array.isArray(s.employmentIds) ? s.employmentIds : [])
                    .map((id) => nameMap[id] ?? `#${id}`)
                    .join(", ");
                return {
                    key: `${s.startTime}-${s.endTime}-${idx}`,
                    text: `${hhmm(s.startTime)} ~ ${hhmm(s.endTime)}   ${names || "(이름 없음)"}`,
                };
            });
    }, [todayShifts, nameMap]);

    return (
        <SafeAreaView style={s.container}>
            <View style={s.header}>
                <Text style={s.title}>{user.name ? `${user.name}님 홈` : "사장님 홈"}</Text>
                <TouchableOpacity onPress={() => navigation.navigate("OwnerNotice")}>
                    <Ionicons name="notifications-outline" size={26} color="#111" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* 매장 */}
                <TouchableOpacity style={s.card} onPress={() => navigation.navigate("WorkplaceInfo")}>
                    <Text style={s.cardTitle}>📍 내 매장</Text>
                    <Text style={s.cardMain}>
                        {loadingRep ? "불러오는 중..." : repWp?.name ?? "대표 매장을 선택해주세요"}
                    </Text>
                    <Text style={s.cardSub}>{loadingRep ? "" : repWp?.address ?? ""}</Text>
                </TouchableOpacity>

                {/* 요약 */}
                <View style={s.row}>
                    <TouchableOpacity
                        style={[s.infoBox, { backgroundColor: "#007AFF" }]}
                        onPress={() => navigation.navigate("EmployeeManage")}
                    >
                        <Ionicons name="people-outline" size={28} color="#fff" />
                        <Text style={s.infoLabel}>직원 수</Text>
                        <Text style={s.infoValue}>{loadingEmpCount ? "…" : `${empCount}명`}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[s.infoBox, { backgroundColor: "#34C759" }]}
                        onPress={() => navigation.navigate("CheckedInList")}
                        disabled={!workplaceId}
                    >
                        <Ionicons name="checkmark-done-outline" size={28} color="#fff" />
                        <Text style={s.infoLabel}>출근 인원</Text>
                        <Text style={s.infoValue}>{loadingCheckedIn ? "…" : `${checkedInCount}명`}</Text>
                    </TouchableOpacity>
                </View>

                {/* 급여/업무 */}
                <TouchableOpacity style={s.payCard} activeOpacity={0.8} onPress={() => navigation.navigate("PayManage")}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Ionicons name="cash-outline" size={26} color="#007AFF" />
                        <Text style={s.payTitle}>급여 관리</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={22} color="#aaa" />
                </TouchableOpacity>

                <TouchableOpacity style={s.taskCard} activeOpacity={0.8} onPress={() => navigation.navigate("OwnerTasks")}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Ionicons name="clipboard-outline" size={24} color="#007AFF" />
                        <Text style={s.taskTitle}>업무 관리</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={22} color="#aaa" />
                </TouchableOpacity>

                {/* 오늘 근무 일정 (사장) */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>🗓️ 오늘 근무 일정</Text>
                    <View style={[s.sectionCard, { paddingVertical: 16 }]}>
                        {loadingShifts || loadingNames ? (
                            <Text style={s.cardSubText}>불러오는 중…</Text>
                        ) : ownerShiftLines.length === 0 ? (
                            <Text style={s.cardSubText}>등록된 일정이 없습니다.</Text>
                        ) : (
                            ownerShiftLines.map(({ key, text }) => (
                                <View key={key} style={s.lineRow}>
                                    <Text style={s.cardText}>{text}</Text>
                                </View>
                            ))
                        )}
                    </View>
                </View>

                {/* 최근 공지 */}
                <View style={s.section}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={s.sectionTitle}>📢 최근 공지사항</Text>
                        <TouchableOpacity onPress={() => navigation.navigate("OwnerNotice")}>
                            <Text style={{ color: "#007AFF", fontWeight: "600" }}>전체 보기</Text>
                        </TouchableOpacity>
                    </View>
                    {latest3.length === 0 ? (
                        <Text style={{ color: "#777" }}>등록된 공지가 없습니다.</Text>
                    ) : (
                        latest3.map((n, idx) => (
                            <TouchableOpacity key={n.id ?? idx} style={s.noticeCard} onPress={() => navigation.navigate("OwnerNotice")}>
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
    title: { fontSize: 22, fontWeight: "bold", color: "#111" },

    card: { backgroundColor: "#fff", margin: 16, borderRadius: 16, padding: 20, elevation: 3 },
    cardTitle: { fontSize: 16, color: "#666" },
    cardMain: { fontSize: 22, fontWeight: "bold", marginVertical: 6, color: "#111" },
    cardSub: { fontSize: 14, color: "#777" },

    row: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
    infoBox: { flex: 1, marginHorizontal: 8, borderRadius: 16, padding: 20, alignItems: "center" },
    infoLabel: { color: "#fff", marginTop: 6, fontSize: 14 },
    infoValue: { color: "#fff", fontSize: 18, fontWeight: "bold" },

    payCard: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        backgroundColor: "#fff", borderRadius: 12, padding: 16, marginHorizontal: 16, marginTop: 20, elevation: 2,
    },
    payTitle: { fontSize: 16, fontWeight: "bold", color: "#111", marginLeft: 8 },

    section: { marginHorizontal: 16, marginTop: 24 },
    sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
    sectionCard: { backgroundColor: "#fff", borderRadius: 12, padding: 14, elevation: 2 },

    cardText: { fontSize: 15, fontWeight: "600" },
    cardSubText: { color: "#555", marginTop: 4, fontSize: 13 },

    lineRow: { paddingVertical: 4 },

    noticeCard: {
        flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
        borderRadius: 10, padding: 10, marginBottom: 8, elevation: 1,
    },
    noticeText: { marginLeft: 8, color: "#333", fontSize: 13 },

    taskCard: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        backgroundColor: "#fff", borderRadius: 12, padding: 16, marginHorizontal: 16, marginTop: 20, elevation: 2,
    },
    taskTitle: { fontSize: 16, fontWeight: "bold", color: "#111", marginLeft: 8 },
});
