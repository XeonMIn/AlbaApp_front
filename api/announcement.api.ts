// api/announcement.api.ts
import api from "@/api/axios";

export type AnnouncementDto = {
    id?: number;                         // 수정/삭제에 필요
    title: string;
    content: string;
    createdtime?: string;
    workplaceId: number;
    event?: "created" | "updated" | "deleted";
};

export async function fetchAnnouncements(workplaceId: number) {
    // 백엔드 호환 경로 사용
    const { data } = await api.get(`/announcement/workplace/${workplaceId}`);
    return data as AnnouncementDto[];
}

export async function createAnnouncement(payload: AnnouncementDto) {
    const { data } = await api.post(`/announcement/add`, payload);
    return data as string;
}

export async function updateAnnouncement(id: number, payload: AnnouncementDto) {
    const { data } = await api.put(`/announcement/${id}`, payload);
    return data as string;
}

export async function deleteAnnouncement(id: number) {
    const { data } = await api.delete(`/announcement/${id}`);
    return data as string;
}
