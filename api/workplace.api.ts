import API from "./axios";

export interface WorkplaceResponse {
    id: number;
    name: string;
    address: string;
    businessnumber: string;
    businesshour: string;
    contactphoneNumber: string;
    createdtime?: string;
}

/** 매장 상세 */
export async function getWorkplaceDetail(workplaceId: number): Promise<WorkplaceResponse> {
    const res = await API.get<WorkplaceResponse>(`/workplace/${workplaceId}`);
    return res.data;
}

/** 직원 수(순환 없이 count 전용) */
export async function getWorkplaceEmployeesCount(workplaceId: number): Promise<number | null> {
    try {
        const res = await API.get<number>(`/member/workplace/${workplaceId}/count`);
        return typeof res.data === "number" ? res.data : null;
    } catch (e) {
        console.log("직원 수 조회 실패:", e);
        return null;
    }
}

/** 내가 속한 모든 매장 */
export async function getMyWorkplaces(): Promise<WorkplaceResponse[]> {
    const res = await API.get<WorkplaceResponse[]>(`/workplace/mine`);
    return res.data || [];
}

/** 매장 정보 수정 */
export async function updateWorkplace(
    id: number,
    body: Pick<WorkplaceResponse, "name" | "address" | "businessnumber" | "businesshour" | "contactphoneNumber">
): Promise<string> {
    const res = await API.put<string>(`/workplace/${id}`, body);
    return (res.data ?? "ok") as string;
}
