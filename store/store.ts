// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice"; // userSlice.ts가 같은 폴더에 있어야 함

// 중앙 Redux 스토어 생성
export const store = configureStore({
    reducer: {
        user: userReducer,
    },
});

// 타입 정의 (선택사항이지만 권장)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
