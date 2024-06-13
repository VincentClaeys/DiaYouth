import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { supabase } from "../../utils/supabase";
import { useNavigation } from "@react-navigation/native";
import background from "../../../assets/images/header2.png";
import { ImageBackground } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";

// imports of the components
import SearchEventSection from "./EventPageSections/searchEventSection";
import PopulairEventsSection from "./EventPageSections/populairEventsSection";
import AllEventsSection from "./EventPageSections/allEventsSection";
import UploadPhoto from "./EventPageSections/uploadPhoto";
import ImageItem from "./EventPageSections/viewPhoto";
import AddNewEventSection from "./EventPageSections/addNewEvent";


const EventPage = () => {
  const [userId, setUserId] = useState("");
  const [quote, setQuote] = useState("");
  const navigation = useNavigation();

  const navigateToEventLikes = () => {
    navigation.navigate("EventLikes");
  };

  useEffect(() => {
    const fetchUsername = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
        ></ImageBackground>
        <View style={styles.pageHeader}>
          <View style={styles.pageTitleContainer}>
            <Text style={styles.pageTitle}>Activiteiten</Text>
            <Text style={styles.pageSubtitle}>Prik de saaie momenten weg!</Text>
          </View>
          <MaterialIcons style={styles.eventsIcon} name="event" onPress={navigateToEventLikes} size={30}color="white" />
        </View>
        <View style={styles.eventContentContainer}>
            {/* <SearchEventSection /> */}
            <AddNewEventSection />
            <PopulairEventsSection />
           
            <AllEventsSection />
     
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // ... (other styles)
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
  // Updated styles for the header container
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
    color: "#3584fc", // lichtblauw -- Hoofdkleur
    fontSize: 30,
  },
  pageSubtitle: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658", // donkerblauw -- Subkleur (voor tekst)
    fontSize: 12,
    fontWeight: "400",
    marginBottom: 5,
  },
  eventContentContainer: {
    width: "90%",
    // Add any additional styles for your event content
  },
});

export default EventPage;
