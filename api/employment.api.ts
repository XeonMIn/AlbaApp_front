// api/employment.api.ts
import API from "./axios";

export interface JoinWorkplaceResponse {
    success: boolean;
    workplaceId: number;
    workplaceName: string;
}

/** 매장 코드로 근무지 조인 (알바 ↔ 매장 Employment 생성) */
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
