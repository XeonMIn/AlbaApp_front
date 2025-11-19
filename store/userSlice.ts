import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
    id: number | null;
    userId: string | null;
    name: string | null;
    role: string | null;
    email:string | null;
    phoneNumber: string | null;
    isLoggedIn: boolean;
    accessToken: string | null;
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
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        // 로그인·유저 정보 저장
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
            }>
        ) => {
            state.id = action.payload.id;
            state.userId = action.payload.userId;
            state.name = action.payload.name;
            state.role = action.payload.role;
            state.email = action.payload.email ?? null;
            state.phoneNumber = action.payload.phoneNumber ?? null;
            state.isLoggedIn = true;
            state.accessToken = action.payload.accessToken ?? null;
        },

        // ★ 프로필 수정용 업데이트
        updateUser: (
            state,
            action: PayloadAction<{
                name?: string;
                email?: string;
                phoneNumber?: string;
            }>
        ) => {
            if (action.payload.name !== undefined) state.name = action.payload.name;
            if (action.payload.email !== undefined) state.email = action.payload.email;
            if (action.payload.phoneNumber !== undefined)
                state.phoneNumber = action.payload.phoneNumber;
        },

        // 로그아웃 (401 자동 로그아웃 포함)
        logout: (state) => {
            state.id = null;
            state.userId = null;
            state.name = null;
            state.role = null;
            state.email = null;
            state.phoneNumber = null;
            state.isLoggedIn = false;
            state.accessToken = null;
        },
    },
});

export const { setUser, updateUser, logout } = userSlice.actions;
export default userSlice.reducer;
