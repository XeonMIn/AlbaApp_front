// AlbaApp_front/api/schedule.ts
import axios from "./axios";

// 백엔드에서 오는 스케줄 형태 (필요하면 필드 추가/수정)
export interface BackendSchedule {
    id: number;
    dayOfWeek: string;   // "MONDAY" 같은 문자열
    startTime: string;   // "09:00:00"
    endTime: string;     // "13:00:00"
    // title, memo 같은 게 DTO에 있으면 여기에 추가
}

// 1) 특정 매장 + 특정 요일 스케줄 조회
export async function getSchedulesByWorkplaceAndDay(
    workplaceId: number,
    dayOfWeek: string
) {
    const res = await axios.get<BackendSchedule[]>(
        `/schedules/workplace/${workplaceId}/day/${dayOfWeek}`
    );
    return res.data;
}

// 2) 스케줄 생성 (POST /schedules/{workplaceId}?employmentId=..)
export async function createSchedule(
    workplaceId: number,
    dto: {
        dayOfWeek: string;
        startTime: string; // "09:00:00"
        endTime: string;   // "13:00:00"
    },
    employmentId?: number
) {
    const params = employmentId ? { employmentId } : undefined;
    const res = await axios.post(`/schedules/${workplaceId}`, dto, { params });
    return res.data;
}

// 3) 스케줄 수정 (PUT /schedules/{id})
export async function updateSchedule(
    id: number,
    dto: {
        dayOfWeek: string;
        startTime: string;
        endTime: string;
    }
) {
    const res = await axios.put(`/schedules/${id}`, dto);
    return res.data;
}

// 4) 스케줄 삭제 (DELETE /schedules/{id})
export async function deleteSchedule(id: number) {
    return axios.delete(`/schedules/${id}`);
}
