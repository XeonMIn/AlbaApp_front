import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import { store } from "./store/store"; // 새로 만든 Redux 스토어
import RootNavigator from "./app/navigators/RootNavigator";

export default function App() {
    return (
        <Provider store={store}>
            <NavigationContainer>
                <RootNavigator />
            </NavigationContainer>
        </Provider>
    );
}
