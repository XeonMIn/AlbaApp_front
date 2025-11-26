// api/member.api.ts
import API from "./axios";

export type Role = "CEO" | "OWNER" | "ALBA" | "EMPLOYEE";

export type MemberProfile = {
    id: number;
    userId: string;
    name: string;
    email?: string;
    phoneNumber?: string;
    role: Role | string;
    workplaceId?: number | null;
    workplaceName?: string | null;
};

// 백엔드에 /member/profile/{id} 가 있다고 했으니 그대로 사용
export async function fetchProfileById(userId: number) {
    const { data } = await API.get<MemberProfile>(`/member/profile/${userId}`);
    return data;
}

// 혹시 /member/me 로 쓰고 싶을 때
export async function fetchMyProfile() {
    const { data } = await API.get<MemberProfile>("/member/me");
    return data;
}
