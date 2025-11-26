// api/employment.api.ts
import API from "./axios";

/** =========================
 *  공용 타입
 * ========================= */
export type EmploymentMemberDto = {
    employmentId: number;   // 기존 lookup 응답 형태
    memberId: number;
    memberName: string;
};

export type EmploymentSimple = {
    id: number;             // 새 API에서의 employmentId
    memberId: number;
    memberName: string;
};

/** =========================
 *  1) 매장 조인 (기존 그대로 유지)
 * ========================= */
export interface JoinWorkplaceResponse {
    success: boolean;
    workplaceId: number;
    workplaceName: string;
}
export async function joinWorkplace(code: string): Promise<JoinWorkplaceResponse> {
    const res = await API.post<JoinWorkplaceResponse>("/employment/join", { code });
    return res.data;
}

/** =========================
 *  2) 직원 수 (기존 엔드포인트 유지)
 *     - 실패 시 0 반환
 * ========================= */
export async function getEmploymentCountByWorkplace(workplaceId: number): Promise<number> {
    try {
        const res = await API.get<any[]>(`/employment/workplace/${workplaceId}/alba`);
        return Array.isArray(res.data) ? res.data.length : 0;
    } catch (e) {
        console.log("Employment(ALBA) 목록 조회 실패:", e);
        return 0;
    }
}

/** =========================
 *  3) 직원 목록 조회 (하위호환 + 신규 API 동시 지원)
 * ========================= */

/** 새 API 형태 → 기존 타입으로 매핑 */
function mapSimpleToMemberDto(x: EmploymentSimple): EmploymentMemberDto {
    return {
        employmentId: x.id,
        memberId: x.memberId,
        memberName: x.memberName,
    };
}

/** (구) 기존 API 그대로 사용: GET /employment/lookup/{workplaceId} */
export async function fetchEmploymentList(workplaceId: number): Promise<EmploymentMemberDto[]> {
    const res = await API.get<EmploymentMemberDto[]>(`/employment/lookup/${workplaceId}`);
    return res.data;
}

/** (신) 새 API: GET /employment/by-workplace/{workplaceId} */
export async function fetchEmploymentsByWorkplace_New(workplaceId: number): Promise<EmploymentMemberDto[]> {
    const res = await API.get<EmploymentSimple[]>(`/employment/by-workplace/${workplaceId}`);
    const list = Array.isArray(res.data) ? res.data : [];
    return list.map(mapSimpleToMemberDto);
}

/** 통합 안전 호출: 새→구 순으로 폴백 */
export async function fetchEmploymentListSafe(workplaceId: number): Promise<EmploymentMemberDto[]> {
    try {
        return await fetchEmploymentsByWorkplace_New(workplaceId);
    } catch (eNew: any) {
        try {
            return await fetchEmploymentList(workplaceId);
        } catch (eOld: any) {
            console.log("직원 목록 조회 실패(신규/기존 모두):", eNew?.response?.status, eOld?.response?.status);
            return [];
        }
    }
}

/** =========================
 *  4) 내 고용 정보 (알바 전용)
 *     GET /employment/my?workplaceId=
 * ========================= */
export async function fetchMyEmployment(workplaceId: number): Promise<EmploymentMemberDto | null> {
    try {
        const res = await API.get<EmploymentSimple>(`/employment/my`, { params: { workplaceId } });
        if (!res?.data) return null;
        return mapSimpleToMemberDto(res.data);
    } catch (e: any) {
        if (e?.response?.status === 404) return null;
        console.log("내 고용 정보 조회 실패:", e?.response?.status || e);
        return null;
    }
}

/** =========================
 *  5) 유틸
 * ========================= */
export async function isMyEmployment(workplaceId: number, employmentId?: number | null): Promise<boolean> {
    if (!employmentId) return false;
    const me = await fetchMyEmployment(workplaceId);
    return !!me && me.employmentId === employmentId;
}

/** =========================
 *  6) 호환성용 별칭
 *  화면 코드에서 import { fetchEmploymentsByWorkplace }를 그대로 써도 되도록 alias 제공
 * ========================= */
export { fetchEmploymentsByWorkplace_New as fetchEmploymentsByWorkplace };
