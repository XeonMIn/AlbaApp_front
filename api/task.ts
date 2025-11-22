import API from "./axios";

/** 직원 내 업무 항목 */
export type TaskAssignmentDto = {
    id: number;
    taskId: number | null;
    taskName: string | null;       // ✅ 업무 이름
    employmentId: number | null;
    memberId: number | null;
    memberName: string | null;     // ✅ 담당자 이름
    status: "ASSIGNED" | "DONE";
    assignedAt?: string | null;
    completedAt?: string | null;
};

/** 사장 카드 목록용 */
export type TaskCard = {
    id: number;
    name: string;
    assigned: boolean;
    assigneeName: string | null;
};

export async function fetchMyTasks(workplaceId: number, memberId: number) {
    const { data } = await API.get<TaskAssignmentDto[]>("/task/my", {
        params: { workplaceId, memberId },
    });
    return data ?? [];
}

export async function completeTask(assignmentId: number, memberId: number) {
    await API.post(`/task/complete/${assignmentId}`, null, { params: { memberId } });
}

export async function createTask(payload: { workplaceId: number; name: string }) {
    await API.post("/task/add", payload);
}

export async function assignTask(payload: { taskId: number; employmentId: number }) {
    await API.post("/task/assign", payload);
}

export async function fetchWorkplaceTasks(workplaceId: number) {
    const { data } = await API.get<TaskCard[]>(`/task/workplace/${workplaceId}`);
    return data ?? [];
}

export async function deleteTask(taskId: number) {
    await API.delete(`/task/${taskId}`);
}
