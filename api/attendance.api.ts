// src/api/attendance.api.ts
import API from "./axios";

// 퇴근 요청
export async function clockOutRequest(memberId: number, workPlaceId: number) {
    const res = await API.post("/attendance/clock-out", {
        memberId,
        workPlaceId,
    });
    return res.data;
}

