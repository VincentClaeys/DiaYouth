import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ImageBackground } from "react-native";
import { supabase } from "../../utils/supabase";
import { useNavigation } from "@react-navigation/native";
import background from "../../../assets/images/header2.png";
import { MaterialIcons } from "@expo/vector-icons";

// Components
import PopulairEventsSection from "./EventPageSections/populairEventsSection";
import AllEventsSection from "./EventPageSections/allEventsSection";
import AddNewEventSection from "./EventPageSections/addNewEvent";


const EventPage = () => {
  const [userId, setUserId] = useState("");
  const navigation = useNavigation();

  // Navigate to Event Likes screen
  const navigateToEventLikes = () => navigation.navigate("EventLikes");

  // Fetch current user's ID
  useEffect(() => {
    const fetchUsername = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user.id);
    };

    fetchUsername();
  }, []);

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <ImageBackground
          source={background}
          style={styles.backgroundImage}
        />
        <View style={styles.pageHeader}>
          <View style={styles.pageTitleContainer}>
            <Text style={styles.pageTitle}>Activiteiten</Text>
            <Text style={styles.pageSubtitle}>Prik de saaie momenten weg!</Text>
          </View>
          <MaterialIcons style={styles.eventsIcon} name="event" onPress={navigateToEventLikes} size={30} color="white" />
        </View>
        <View style={styles.eventContentContainer}>

            <AddNewEventSection />
            <PopulairEventsSection />
            <AllEventsSection />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 200,
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImage: {
    height: 800,
    position: "absolute",
    top: -440,
    left: -200,
    right: -80,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventsIcon: {
    marginRight: 5,
    marginBottom: 15,
  },
  pageHeader: {
    display: "flex",
    flexDirection: "row",
    marginTop: 100,
    justifyContent: "space-between",
    width: "90%",
    alignContent: "center",
    alignItems: "center",
  },
  pageTitleContainer: {
    display: "flex",
    flexDirection: "column",
    marginLeft: 10,
  },
  pageTitle: {
    fontFamily: "AvenirNext-Bold",
    color: "#3584fc", // Light blue -- Main color
    fontSize: 30,
  },
  pageSubtitle: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658", // Dark blue -- Sub-color (for text)
    fontSize: 12,
    fontWeight: "400",
    marginBottom: 5,
  },
  eventContentContainer: {
    width: "90%",
    // Additional styles for event content can be added here
  },
});

export default EventPage;
