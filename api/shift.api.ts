import API from "@/api/axios";

export type Shift = {
    id: number;
    workplaceId: number;
    workDate: string;
    startTime: string;
    endTime: string;
    title?: string | null;
    employmentIds: number[]; // 여러명
};

export type CreateShiftDto = {
    workplaceId: number;
    workDate: string;   // YYYY-MM-DD
    startTime: string;  // HH:mm
    endTime: string;    // HH:mm
    title?: string;
    employmentIds: number[]; // ✅ 반드시 배열로 전송
};

export type UpdateShiftDto = Partial<Omit<CreateShiftDto, "workplaceId">>;

export async function fetchShiftsRange(workplaceId: number, start: string, end: string, opts?: { employmentId?: number }) {
    const params: any = { workplaceId, start, end };
    if (opts?.employmentId) params.employmentId = opts.employmentId;
    const { data } = await API.get<Shift[]>("/shifts", { params });
    return data;
}

export async function fetchShiftsByDate(workplaceId: number, date: string, opts?: { employmentId?: number }) {
    const params: any = { workplaceId, date };
    if (opts?.employmentId) params.employmentId = opts.employmentId;
    const { data } = await API.get<Shift[]>("/shifts/by-date", { params });
    return data;
}

export async function createShift(dto: CreateShiftDto) {
    const { data } = await API.post<Shift>("/shifts", dto);
    return data;
}

export async function updateShift(id: number, dto: UpdateShiftDto) {
    const { data } = await API.put<Shift>(`/shifts/${id}`, dto);
    return data;
}

export async function deleteShift(id: number) {
    await API.delete(`/shifts/${id}`);
}
