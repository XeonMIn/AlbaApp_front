// store/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
    userId: string | null;
    name: string | null;
    role: "OWNER" | "EMPLOYEE" | null;
    isLoggedIn: boolean;
}

const initialState: UserState = {
    userId: null,
    name: null,
    role: null,
    isLoggedIn: false,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (
            state,
            action: PayloadAction<{ userId: string; name: string; role: "OWNER" | "EMPLOYEE" }>
        ) => {
            state.userId = action.payload.userId;
            state.name = action.payload.name;
            state.role = action.payload.role;
            state.isLoggedIn = true;
        },
        logout: (state) => {
            state.userId = null;
            state.name = null;
            state.role = null;
            state.isLoggedIn = false;
        },
    },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
