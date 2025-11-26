import API from "./axios";

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

export const getLatestPay = async (memberId: number) => {
    const res = await API.get(`/pay/latest?memberId=${memberId}`);
    return res.data;
};

export const getPayListByMember = async (memberId: number) => {
    const res = await API.get(`/pay/list?memberId=${memberId}`);
    return res.data;
};

export const getPayListByWorkplace = async (workplaceId: number) => {
    const res = await API.get(`/pay/workplace/${workplaceId}`);
    return res.data;
};

// 추가된 부분: 급여 수정
export const updatePay = async (payId: number, body: any) => {
    const res = await API.put(`/pay/${payId}`, body);
    return res.data;
};
