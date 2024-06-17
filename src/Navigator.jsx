import React from "react";
import { View } from "react-native";

// Navigation imports
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

// Icon imports
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";

// Page imports
import HomeScreen from "./pages/Homepage/homePage";
import Profile from "./pages/SettingsPage/SettingsPageSections/profile";
import settingsPage from "./pages/SettingsPage/settingsPage";
import QuestionPage from "./pages/QuestionPage/questionPage";
import PeptalkSubmissions from "./pages/SettingsPage/SettingsPageSections/ProfilePeptalks/peptalkSubmissions";
import PeptalkLikes from "./pages/SettingsPage/SettingsPageSections/ProfilePeptalks/peptalkLikes";
import EventLikes from "./pages/SettingsPage/SettingsPageSections/ProfileEvents/eventLikes";
import QuestionLikes from "./pages/SettingsPage/SettingsPageSections/ProfileQuestions/questionLikes";
import PepTalkPage from "./pages/PeptalkPage/peptalkPage";
import QuestionSubmissions from "./pages/SettingsPage/SettingsPageSections/ProfileQuestions/questionSubmissions";
import EventPage from "./pages/Eventpage/eventPage";
import EventDetail from "./pages/Eventpage/EventPageSections/eventDetail";
import FAQDetail from "./pages/Homepage/HomepageSections/FAQDetail";
import NewUserDetail from "./pages/Homepage/HomepageSections/newUserDetail";
import EventUpdate from "./pages/Eventpage/EventPageSections/eventUpdate";
import EventSubmissions from "./pages/SettingsPage/SettingsPageSections/ProfileEvents/eventSubmissions";
import EventJoined from "./pages/SettingsPage/SettingsPageSections/ProfileEvents/eventJoined";

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainNavigator({ session }) {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarStyle: {
          position: "absolute",
          bottom: 20,
          left: 10,
          right: 10,
          elevation: 0,
          height: 80,
          borderRadius: 50,
          borderColor: "#FAF8FC",
          borderWidth: 2.5,
          backgroundColor: "#FAF8FC",
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 3,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        },
        tabBarIconStyle: {
          color: "white",
          marginTop: 20,
        },
        tabBarActiveTintColor: "#3584fc",
        tabBarInactiveTintColor: "lightgray",
      }}
    >
      {/* Home Screen */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
          tabBarLabel: "",
          tabBarIcon: ({ color, size }) => (
            <View style={styles.tabIconContainer}>
              <MaterialCommunityIcons name="home" color={color} size={size + 8} />
            </View>
          ),
        }}
      />

      {/* PepTalk Screen */}
      <Tab.Screen
        name="PepTalk"
        component={PepTalkPage}
        options={{
          headerShown: false,
          tabBarLabel: "",
          tabBarIcon: ({ color, size }) => (
            <View style={styles.tabIconContainer}>
              <FontAwesome5 name="hands-helping" color={color} size={size + 8} />
            </View>
          ),
        }}
      />

      {/* Questions Screen */}
      <Tab.Screen
        name="Questions"
        component={QuestionPage}
        options={{
          headerShown: false,
          tabBarLabel: "",
          tabBarIcon: ({ color, size }) => (
            <View style={styles.tabIconContainer}>
              <MaterialCommunityIcons name="comment-question" color={color} size={size + 8} />
            </View>
          ),
        }}
      />

      {/* Events Screen */}
      <Tab.Screen
        name="Events"
        component={EventPage}
        options={{
          headerShown: false,
          tabBarLabel: "",
          tabBarIcon: ({ color, size }) => (
            <View style={styles.tabIconContainer}>
              <MaterialIcons name="event" size={size + 8} color={color} />
            </View>
          ),
        }}
      />

      {/* Profile/Settings Screen */}
      <Tab.Screen
        name="Profile"
        component={settingsPage}
        options={{
          headerShown: false,
          tabBarLabel: "",
          tabBarIcon: ({ color, size }) => (
            <View style={styles.tabIconContainer}>
              <Ionicons name="settings-sharp" size={size + 8} color={color} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator({ session }) {
  return (
    <Stack.Navigator initialRouteName="Main">
      {/* Main Tab Navigator */}
      <Stack.Screen
        name="Main"
        component={MainNavigator}
        options={{ headerShown: false }}
      />

      {/* Likes on Settings Page */}
      <Stack.Screen
        name="PeptalkLikes"
        component={PeptalkLikes}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EventLikes"
        component={EventLikes}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="QuestionLikes"
        component={QuestionLikes}
        options={{ headerShown: false }}
      />

      {/* Submissions on Settings Page */}
      <Stack.Screen
        name="PeptalkSubmissions"
        component={PeptalkSubmissions}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="QuestionSubmissions"
        component={QuestionSubmissions}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EventSubmissions"
        component={EventSubmissions}
        options={{ headerShown: false }}
      />

      {/* Other Routes */}
      <Stack.Screen
        name="EventDetail"
        component={EventDetail}
        options={{ headerShown: false }}
      />
          <Stack.Screen
        name="EventJoined"
        component={EventJoined}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EventUpdate"
        component={EventUpdate}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FAQDetail"
        component={FAQDetail}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NewUserDetail"
        component={NewUserDetail}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Account"
        options={{
          headerShown: false,
          tabBarLabel: "Account",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      >
        {() => <Profile session={session} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// Styles
const styles = {
  tabIconContainer: {
    height: 60,
    width: 60,
    alignItems: "center",
    justifyContent: "flex-end",
  },
};

export default AppNavigator;
