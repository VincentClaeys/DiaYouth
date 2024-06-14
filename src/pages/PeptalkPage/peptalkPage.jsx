// Import React
import React from "react";

// Import components and utilities from react-native
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ImageBackground } from "react-native";
import { useNavigation } from "@react-navigation/native";

// Import images and icons
import background from "../../../assets/images/header2.png";
import { Fontisto } from "@expo/vector-icons";

// Import sections of the Peptalk page
import AllPeptalksSection from "./PeptalkPageSections/allPeptalksSection";
import AddPeptalkSection from "./PeptalkPageSections/addPeptalkSection";

const PepTalkPage = () => {

  const navigation = useNavigation();

  // Navigate to the likes page
  const navigateToProfileLikes = () => {
    navigation.navigate('PeptalkLikes');
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header section */}
      <View style={styles.header}>
        <ImageBackground
          source={background}
          style={styles.backgroundImage}
        ></ImageBackground>
        
        {/* Welcome text and like button */}
        <View style={styles.welcomeContentContainer}>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeText}>Peptalk-wall</Text>
            <Text style={styles.welcomeTextDescription}>
            Deel een quote, net zoals we cola delen.
            </Text>
          </View>
          
          {/* Like button */}
          <Fontisto
            onPress={navigateToProfileLikes}
            style={styles.peptalkLikeIcon}
            name="heart"
            size={30}
            color="white"
          />
        </View>

        {/* Peptalk content */}
        <View style={styles.peptalkContentContainer}>
          <AddPeptalkSection />
          <AllPeptalksSection />
        </View>
      </View>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
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
    color: "#3584fc",
    fontSize: 30,
  },
  welcomeTextDescription: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 12,
    fontWeight: "400",
    marginBottom: 5,
  },
  peptalkLikeIcon: {
    marginRight: 5,
    marginBottom: 15,
  },
  peptalkContentContainer: {
    width: "90%",
  },
});

export default PepTalkPage;
