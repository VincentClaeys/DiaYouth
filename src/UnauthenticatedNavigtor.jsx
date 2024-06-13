import { createStackNavigator } from "@react-navigation/stack";
import Auth from "./utils/Login";
import Register from "./pages/register";

const Stack = createStackNavigator();

export default function UnauthenticatedNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        component={Auth}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={Register}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
