// app/constants/Routes.ts
export const Routes = {
    Root: {
        AuthStack: 'AuthStack',
        OwnerTab: 'OwnerTab',
        EmployeeTab: 'EmployeeTab',
    },
    Employee: {
        HomeStack: 'EmployeeHomeStack', // ← 컨테이너(스택) 이름
        Home: 'EmployeeHome',           // ← 실제 화면(리프) 이름
        Schedule: 'EmployeeSchedule',
        Task: 'EmployeeTask',
        Notice: 'EmployeeNotice',
        Chat: 'EmployeeChat',
    },
    Owner: {
        Home: 'OwnerHome',
    },
} as const;
