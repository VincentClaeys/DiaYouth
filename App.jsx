import { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { supabase } from "./src/utils/supabase";

// Authenticated and Unauthenticated Navigators
import UnauthenticatedNavigator from "./src/UnauthenticatedNavigtor";
import AppNavigator from "./src/Navigator";

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking auth...");
      const session = supabase.auth.getUser();
      setSession(session);
    };

    checkAuth();

    supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", session);
      setSession(session);
    });
  }, []);

  return (
    <NavigationContainer>
      {session ? (
        <AppNavigator session={session} />
      ) : (
        <UnauthenticatedNavigator />
      )}
    </NavigationContainer>
  );
}
