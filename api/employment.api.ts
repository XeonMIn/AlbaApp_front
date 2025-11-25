// api/employment.api.ts
import API from "./axios";

/** 매장 코드로 근무지 조인 (알바 ↔ 매장 Employment 생성) */
export interface JoinWorkplaceResponse {
    success: boolean;
    workplaceId: number;
    workplaceName: string;
}
export async function joinWorkplace(code: string): Promise<JoinWorkplaceResponse> {
    const res = await API.post<JoinWorkplaceResponse>("/employment/join", { code });
    return res.data;
}

/** ✅ 직원 수 폴백: '알바' 전용 목록 길이 */
export async function getEmploymentCountByWorkplace(workplaceId: number): Promise<number> {
    try {
        const res = await API.get<any[]>(`/employment/workplace/${workplaceId}/alba`);
        return Array.isArray(res.data) ? res.data.length : 0;
    } catch (e) {
        console.log("Employment(ALBA) 목록 조회 실패:", e);
        return 0;
    }
}

/** ====== 여기부터 목록 조회 추가/수정 ====== */
export type EmploymentMemberDto = {
    employmentId: number;
    memberId: number;
    memberName: string;
};

/** ✅ 실제 존재하는 직원(알바) 목록 API: /employment/lookup/{workplaceId} */
export async function fetchEmploymentList(workplaceId: number): Promise<EmploymentMemberDto[]> {
    const res = await API.get<EmploymentMemberDto[]>(`/employment/lookup/${workplaceId}`);
    return res.data;
}
