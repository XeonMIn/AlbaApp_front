import API from "@/api/axios";

export type PayrollLine = {
    employmentId: number;
    memberId: number;
    memberName: string;
    workHours: number;
    nightHours: number;
    holidayHours: number;
    hourlyWage: number;
    basePay: number;
    nightPay: number;
    holidayPay: number;
    gross: number;
    tax: number;
    insurances: number;
    net: number;
};

export type PayrollSummary = {
    year: number;
    month: number;
    lines: PayrollLine[];
    totalGross: number;
    totalNet: number;
};

export async function getPayrollSummary(workplaceId: number, year: number, month: number, employmentId?: number) {
    const { data } = await API.get<PayrollSummary>("/payroll/summary", {
        params: { workplaceId, year, month, employmentId },
    });
    return data;
}

export async function recalcPayroll(workplaceId: number, year: number, month: number, employmentId?: number) {
    const { data } = await API.post<PayrollSummary>("/payroll/recalculate", {
        workplaceId, year, month, employmentId,
    });
    return data;
}

export async function updateWage(employmentId: number, hourlyWage: number) {
    await API.put(`/employment/${employmentId}/wage`, null, { params: { hourlyWage } });
}
