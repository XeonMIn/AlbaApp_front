// App.tsx
import 'react-native-gesture-handler';
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { store } from "./store/store";
import RootNavigator from "./app/navigators/RootNavigator";

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Provider store={store}>
                <NavigationContainer>
                    <RootNavigator />
                </NavigationContainer>
            </Provider>
        </GestureHandlerRootView>
    );
}
