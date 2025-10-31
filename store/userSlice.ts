import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
    userId: string | null;
    name: string | null;
    role: string | null;          // ✅ 모든 문자열 허용 (백엔드 소문자 대응)
    isLoggedIn: boolean;
    accessToken: string | null;   // ✅ 실제 백엔드 필드명에 맞춤
}

const initialState: UserState = {
    userId: null,
    name: null,
    role: null,
    isLoggedIn: false,
    accessToken: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (
            state,
            action: PayloadAction<{
                userId: string;
                name: string;
                role: string;
                accessToken?: string | null;
            }>
        ) => {
            state.userId = action.payload.userId;
            state.name = action.payload.name;
            state.role = action.payload.role;
            state.isLoggedIn = true;
            state.accessToken = action.payload.accessToken || null;
        },
        logout: (state) => {
            state.userId = null;
            state.name = null;
            state.role = null;
            state.isLoggedIn = false;
            state.accessToken = null;
        },
    },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
