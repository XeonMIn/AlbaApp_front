import API from "./axios";

export interface WorkplaceResponse {
    id?: number;
    name: string;
    address: string;
    businessnumber: string;
    businesshour: string;
    contactphoneNumber: string;
    createdtime?: string;
}

export async function getWorkplaceDetail(
    workplaceId: number
): Promise<WorkplaceResponse> {
    const res = await API.get<WorkplaceResponse>(`/workplace/${workplaceId}`);
    return res.data;
}

export async function getWorkplaceEmployeesCount(
    workplaceId: number
): Promise<number | null> {
    try {
        const res = await API.get(`/member/workplace/${workplaceId}`);
        if (Array.isArray(res.data)) {
            return res.data.length;
        }
        return null;
    } catch (e) {
        console.log("직원 수 조회 실패:", e);
        return null;
    }
}
