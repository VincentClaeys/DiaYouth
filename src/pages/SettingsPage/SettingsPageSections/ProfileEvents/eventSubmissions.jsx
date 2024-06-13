import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ImageBackground } from "react-native";
import background from "../../../../../assets/images/header2.png";

import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import AllEventSubmissions from "./allEventSubmissions";

const EventSubmissions = () => {
  const navigation = useNavigation();

  const btnGoBack = () => {
    navigation.navigate("Profile");
  };
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
        <Ionicons
          style={styles.goBackBtn}
          name="return-down-back"
          size={24}
          color="black"
          onPress={btnGoBack}
        />

        <View style={styles.welcomeContentContainer}>
          <View>
            <Text style={styles.welcomeText}>Activiteiten</Text>
            <Text style={styles.welcomeTextDescription}>
              Bekijk al je ingezonden activiteiten.
            </Text>
          </View>

          <MaterialIcons
            style={styles.eventsIcon}
            name="event"
            size={30}
            color="white"
          />
        </View>

        <View style={styles.eventsContentContainer}>
          <AllEventSubmissions />
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

  // styles for the header container

  header: {
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImage: {
    height: 800,

    position: "absolute",
    top: -430,
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
    marginTop: 110,
    justifyContent: "space-between",
    width: "90%",
    alignContent: "center",
    alignItems: "center",
    marginLeft: 20,
  },
  welcomeTextContainer: {
    display: "flex",
    flexDirection: "row",
    marginLeft: 10,
    alignItems: "center",
  },
  welcomeText: {
    fontFamily: "AvenirNext-Bold",
    color: "#3584fc", // lichtblauw -- Hoofdkleur
    fontSize: 30,
  },
  eventsIcon: {
    position: "absolute",
    top: 10,
    right: 15,
  },
  goBackBtn: {
    fontFamily: "AvenirNext-Bold",
    color: "white",
    position: "absolute",
    top: 50,
    left: 20,
  },
  welcomeTextDescription: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658", // donkerblauw -- Subkleur (voor tekst)
    fontSize: 12,
    fontWeight: "400",
    marginBottom: 5,
  },

  eventsContentContainer: {
    width: "90%",
  },
});

export default EventSubmissions;
