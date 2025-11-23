// api/task.ts
import API from "./axios";

/** 직원 내 업무 항목 (알바가 보는 내 업무) */
export type TaskAssignmentDto = {
    id: number;
    taskId: number | null;
    taskName: string | null;            // 업무 이름
    employmentId: number | null;
    memberId: number | null;
    memberName: string | null;          // 담당자(본인) 이름
    status: "ASSIGNED" | "DONE";        // 배정/완료 상태
    assignedAt?: string | null;
    completedAt?: string | null;
};

/** 사장 카드 목록용 (업무 관리 화면) */
export type TaskCard = {
    id: number;
    name: string;                       // 업무 이름
    assigned: boolean;                  // 배정 여부
    status?: "ASSIGNED" | "DONE";       // 배정됨/완료 (백엔드가 내려줄 때 표시)
    assigneeName: string | null;        // 배정된 알바 이름(없으면 null)
};

/** 알바: 내 업무 목록 조회 */
export async function fetchMyTasks(workplaceId: number, memberId: number) {
    const { data } = await API.get<TaskAssignmentDto[]>("/task/my", {
        params: { workplaceId, memberId },
    });
    return data ?? [];
}

/** 알바: 업무 완료 */
export async function completeTask(assignmentId: number, memberId: number) {
    await API.post(`/task/complete/${assignmentId}`, null, { params: { memberId } });
}

/** 알바: 업무 완료 취소 */
export async function uncompleteTask(assignmentId: number, memberId: number) {
    await API.post(`/task/uncomplete/${assignmentId}`, null, { params: { memberId } });
}

/** 사장: 업무 생성 */
export async function createTask(payload: { workplaceId: number; name: string }) {
    await API.post("/task/add", payload);
}

/** 사장: 업무 배정(한 업무 = 한 알바) */
export async function assignTask(payload: { taskId: number; employmentId: number }) {
    await API.post("/task/assign", payload);
}

/** 사장: 매장별 업무 카드 목록 조회 */
export async function fetchWorkplaceTasks(workplaceId: number) {
    const { data } = await API.get<TaskCard[]>(`/task/workplace/${workplaceId}`);
    return data ?? [];
}

/** 사장: 업무 삭제 */
export async function deleteTask(taskId: number) {
    await API.delete(`/task/${taskId}`);
}
