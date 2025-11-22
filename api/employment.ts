import API from "./axios";

export type EmploymentLookupItem = {
    employmentId: number;
    memberId: number | null;
    memberName: string | null;
};

/** 이름 포함 Lookup */
export async function fetchEmploymentLookup(workplaceId: number) {
    const { data } = await API.get<EmploymentLookupItem[]>(`/employment/lookup/${workplaceId}`);
    return data ?? [];
}
