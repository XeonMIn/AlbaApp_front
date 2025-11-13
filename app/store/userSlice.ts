// app/store/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Role = "owner" | "employee" | string;

interface UserState {
    userId: string;
    name: string;
    role: Role;
    isLoggedIn: boolean;
    accessToken: string | null;
}

const initialState: UserState = {
    userId: "",
    name: "",
    role: "",
    isLoggedIn: false,
    accessToken: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser(
            state,
            action: PayloadAction<{
                userId: string;
                name: string;
                role: Role;
                accessToken: string;
            }>
        ) {
            state.userId = action.payload.userId;
            state.name = action.payload.name;
            state.role = action.payload.role;
            state.isLoggedIn = true;
            state.accessToken = action.payload.accessToken;
        },
        logout(state) {
            state.userId = "";
            state.name = "";
            state.role = "";
            state.isLoggedIn = false;
            state.accessToken = null;
        },
    },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
