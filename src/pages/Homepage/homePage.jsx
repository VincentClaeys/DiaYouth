import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { ImageBackground } from "react-native";
import { Avatar } from "react-native-elements";

// Then import specific components and utilities
import { supabase } from "../../utils/supabase";
import { useNavigation } from "@react-navigation/native";
import { SUPABASE_URL } from "@env";

// Import images
import background from "../../../assets/images/header2.png";
import blankProfilePhoto from "../../../assets/images/blank_profile.jpg";

// Import sections of the homepage
import PeptalkSectionHomescreen from "./HomepageSections/peptalkSection";
import PopulairSectionHomescreen from "./HomepageSections/populairSection";
import EventSectionHomescreen from "./HomepageSections/eventSection";

const HomeScreen = () => {
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [photo, setPhoto] = useState("");

  const navigation = useNavigation();

  // Function to navigate to the account screen
  const navigateToAccount = () => {
    navigation.navigate('Account');
  };

  // Function to fetch the username
  const fetchUsername = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUserId(user.id);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (profileData) {
      setUsername(profileData.username);
      setPhoto(profileData.avatar_url);
    }
  };

  // Function to detect changes in the user profile
  const handleProfileChange = (payload) => {
    console.log("Profile change received!", payload);
    if (payload.new.id === userId) {
      fetchUsername();
    }
  };

  useEffect(() => {
    fetchUsername();
    const subscription = supabase
      .channel("profiles")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        handleProfileChange
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUsername();
    }
  }, [userId]);


  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.mainContainer}>
        <View style={styles.header}>
          <ImageBackground
            source={background}
            style={styles.backgroundImage}
          ></ImageBackground>
          <View style={styles.welcomeContentContainer}>
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeText}>Hi, {username}</Text>
              <Text style={styles.welcomeTextDescription}>Op een dag zonder hypo's</Text>
            </View>
            <Avatar
              size={40}
              onPress={navigateToAccount}
              rounded
              source={
                photo
                ? {
                      uri: `${SUPABASE_URL}/storage/v1/object/public/${photo}`,
                    }
                  : blankProfilePhoto // Default image if photo is not available
              }
            />
          </View>
        </View>

        <View style={styles.homePageContentContainer}>
          <PeptalkSectionHomescreen />
          <PopulairSectionHomescreen />
          <EventSectionHomescreen />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
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

  welcomeContentContainer: {
    display: "flex",
    flexDirection: "row",
    marginTop: 100,
    justifyContent: "space-between",
    width: "90%",
    alignContent: "center",
    alignItems: "center",
  },
  welcomeTextContainer: {
    display: "flex",
    flexDirection: "column",
    marginLeft: 10,
  },
  welcomeText: {
    fontFamily: "AvenirNext-Bold",
    color: "#3584fc", // Light blue primary color
    fontSize: 30,
  },
  welcomeTextDescription: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658", // Dark blue secondary color for text
    fontSize: 12,
    fontWeight: "400",
    marginBottom: 5,
  },

  homePageContentContainer: {
    width: "90%",
  },
});

export default HomeScreen;
