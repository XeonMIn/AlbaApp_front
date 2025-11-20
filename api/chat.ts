// app/api/chat.ts
import api from "@/api/axios";

export type ChatHistoryItem = {
    roomId: string;
    sender: string;
    content: string;
    sentAt: number;
};

/** 최근 N개 히스토리(과거→최신 정렬로 반환됨) */
export async function fetchChatHistory(workplaceId: number, size = 50) {
    const { data } = await api.get(`/chat/history/${workplaceId}`, { params: { size } });
    return data as ChatHistoryItem[];
}
