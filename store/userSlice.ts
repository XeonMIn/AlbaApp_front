// store/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
    id: number | null;
    userId: string | null;
    name: string | null;
    role: string | null;
    email: string | null;
    phoneNumber: string | null;
    isLoggedIn: boolean;
    accessToken: string | null;

    // 🔥 매장 정보 저장
    workplaceId: number | null;
    workplaceName: string | null;
}

const initialState: UserState = {
    id: null,
    userId: null,
    name: null,
    role: null,
    email: null,
    phoneNumber: null,
    isLoggedIn: false,
    accessToken: null,
    workplaceId: null,
    workplaceName: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (
            state,
            action: PayloadAction<{
                id: number;
                userId: string;
                name: string;
                role: string;
                email?: string | null;
                phoneNumber?: string | null;
                accessToken?: string | null;
                workplaceId?: number | null;
                workplaceName?: string | null;
            }>
        ) => {
            state.id = action.payload.id;
            state.userId = action.payload.userId;
            state.name = action.payload.name;
            state.role = action.payload.role;
            state.email =
                action.payload.email !== undefined
                    ? action.payload.email
                    : state.email;
            state.phoneNumber =
                action.payload.phoneNumber !== undefined
                    ? action.payload.phoneNumber
                    : state.phoneNumber;
            state.isLoggedIn = true;

            // 토큰도 마찬가지: 안 넘어오면 기존 값 유지
            state.accessToken =
                action.payload.accessToken !== undefined
                    ? action.payload.accessToken
                    : state.accessToken;

            // ✅ 핵심: workplaceId / workplaceName 은
            // "payload에 필드가 있을 때만" 업데이트한다.
            // (undefined면 기존 값 유지, null이 넘어오면 null로 지우기)
            if (action.payload.workplaceId !== undefined) {
                state.workplaceId = action.payload.workplaceId;
            }
            if (action.payload.workplaceName !== undefined) {
                state.workplaceName = action.payload.workplaceName;
            }
        },

        updateUser: (
            state,
            action: PayloadAction<{
                name?: string;
                email?: string | null;
                phoneNumber?: string | null;
            }>
        ) => {
            if (action.payload.name !== undefined) {
                state.name = action.payload.name;
            }
            if (action.payload.email !== undefined) {
                state.email = action.payload.email;
            }
            if (action.payload.phoneNumber !== undefined) {
                state.phoneNumber = action.payload.phoneNumber;
            }
        },

        logout: (state) => {
            state.id = null;
            state.userId = null;
            state.name = null;
            state.role = null;
            state.email = null;
            state.phoneNumber = null;
            state.isLoggedIn = false;
            state.accessToken = null;
            state.workplaceId = null;
            state.workplaceName = null;
        },
    },
});

export const { setUser, updateUser, logout } = userSlice.actions;
export default userSlice.reducer;
