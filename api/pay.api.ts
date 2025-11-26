import API from "./axios";

/** 공통 타입(서버마다 키가 조금 달라도 받기 위한 유연한 타입) */
export type LatestPay = {
    year?: number;
    month?: number;
    // 핵심 표시값
    net?: number;          // 실지급액
    finalPay?: number;     // (구버전) 실지급액
    workHours?: number;    // 근무시간
    totalHours?: number;   // (구버전) 근무시간
    hourlyWage?: number;   // 시급
    wage?: number;         // (구버전) 시급
    // 참고 필드
    gross?: number;
    tax?: number;
    insurances?: number;
    nightHours?: number;
    holidayHours?: number;
};

export const getPayList = async () => {
    const res = await API.get("/pay/list");
    return res.data;
};

export const getPayDetail = async (payId: number) => {
    const res = await API.get(`/pay/detail/${payId}`);
    return res.data;
};

export const generatePay = async (workplaceId: number) => {
    const res = await API.post(`/pay/generate/${workplaceId}`);
    return res.data;
};

/**
 * ✅ 최신 급여 조회 (알바 1명)
 * - 신규 백엔드: GET /payroll/latest?workplaceId=&memberId=&year=&month=
 * - 구버전   : GET /pay/latest?memberId=
 * 둘 다 대응하도록 폴백 처리.
 */
export async function getLatestPay(
    memberId: number,
    workplaceId?: number,
    year?: number,
    month?: number
): Promise<LatestPay> {
    // 신규 엔드포인트 우선 사용
    if (workplaceId) {
        const params: any = { workplaceId, memberId };
        if (year) params.year = year;
        if (month) params.month = month;
        const res = await API.get<LatestPay>("/payroll/latest", { params });
        return res.data;
    }
    // 폴백: 구버전
    const res = await API.get<LatestPay>(`/pay/latest?memberId=${memberId}`);
    return res.data;
}

export const getPayListByMember = async (memberId: number) => {
    const res = await API.get(`/pay/list?memberId=${memberId}`);
    return res.data;
};

export const getPayListByWorkplace = async (workplaceId: number) => {
    const res = await API.get(`/pay/workplace/${workplaceId}`);
    return res.data;
};

// 급여 수정
export const updatePay = async (payId: number, body: any) => {
    const res = await API.put(`/pay/${payId}`, body);
    return res.data;
};
