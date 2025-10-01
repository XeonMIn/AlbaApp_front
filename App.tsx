import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./app/navigators/RootNavigator";

export default function App() {
    return (
        <NavigationContainer>
            <RootNavigator />
        </NavigationContainer>
    );
}
