import API from "@/api/axios";

/** 오늘 미퇴근 인원 한 명의 정보 */
export type CheckedInMemberDto = {
    memberId: number;
    memberName: string;
    checkInAt: string; // ISO string
};

/** 오늘 출근(미퇴근) 인원 수 */
export async function getTodayCheckedInCount(workplaceId: number): Promise<number> {
    const { data } = await API.get("/attendance/today/checked-in/count", {
        params: { workplaceId },
    });
    return Number(data?.count ?? 0);
}

/** 오늘 출근(미퇴근) 명단 */
export async function getTodayCheckedInList(workplaceId: number): Promise<CheckedInMemberDto[]> {
    const { data } = await API.get("/attendance/today/checked-in/list", {
        params: { workplaceId },
    });
    return Array.isArray(data) ? data : [];
}

/** (신형) 내 계정(JWT) 기준 퇴근 — workplaceId는 옵션 */
export async function clockOutMe(workplaceId?: number): Promise<{ message: string }> {
    const body = workplaceId ? { workplaceId } : {};
    const { data } = await API.post("/attendance/clock-out/me", body);
    return typeof data === "string" ? { message: data } : data;
}

/**
 * (구형 호환) 명시적 memberId + workPlaceId 로 퇴근 처리.
 * ⚠️ 서버 컨트롤러는 body 키를 'workPlaceId'로 받음(카멜케이스 주의).
 */
export async function clockOutRequest(
    memberId: number,
    workplaceId: number
): Promise<{ message: string }> {
    const body = { memberId, workPlaceId: workplaceId }; // 서버 스펙과 정확히 일치
    const { data } = await API.post("/attendance/clock-out", body);
    return typeof data === "string" ? { message: data } : data;
}
