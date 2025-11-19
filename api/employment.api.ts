// api/employment.api.ts
import API from "./axios";

export interface JoinWorkplaceResponse {
    success: boolean;
    workplaceId: number;
    workplaceName: string;
}

/**
 * 매장 코드로 근무지 조인 (알바 ↔ 매장 Employment 생성)
 */
export async function joinWorkplace(code: string): Promise<JoinWorkplaceResponse> {
    const res = await API.post<JoinWorkplaceResponse>("/employment/join", { code });
    return res.data;
}
