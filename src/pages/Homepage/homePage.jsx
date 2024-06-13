import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { supabase } from "../../utils/supabase";
import { Alert } from "react-native";
import { ImageBackground } from "react-native";
import background from "../../../assets/images/header2.png";
import { Avatar } from "react-native-elements";
import PeptalkSectionHomescreen from "./HomepageSections/peptalkSection";
import QuestionsSectionHomescreen from "./HomepageSections/questionSection";
import EventSectionHomescreen from "./HomepageSections/eventSection";
import { ScrollView } from "react-native-gesture-handler";
import blankProfilePhoto from "../../../assets/images/blank_profile.jpg";
import { useNavigation } from "@react-navigation/native";
import { SUPABASE_URL } from "@env";

const HomeScreen = () => {
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [photo, setPhoto] = useState("");

  const navigation = useNavigation();

  //  code for navigating to the peptalk wall
    const navigateToAccount = () => {
      navigation.navigate('Account');
    }

  // code for fetching the username

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

  // code for checking if the user has been updated and change the username if so
  const handleInserts = (payload) => {
    console.log("Change received!", payload);
    fetchUsername();
  };

  useEffect(() => {
    fetchUsername();
    supabase
      .channel("profiles")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        handleInserts
      )
      .subscribe();
  }, []);

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
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
          <QuestionsSectionHomescreen />
          <EventSectionHomescreen />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // the whole container of the homepage
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

  // styles for the header container
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
    color: "#3584fc", // lichtblauw -- Hoofdkleur
    fontSize: 30,
  },
  welcomeTextDescription: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658", // donkerblauw -- Subkleur (voor tekst)
    fontSize: 12,
    fontWeight: "400",
    marginBottom: 5,
  },

  // styles for the homepage content container

  homePageContentContainer: {
    width: "90%",
  },
});

export default HomeScreen;
