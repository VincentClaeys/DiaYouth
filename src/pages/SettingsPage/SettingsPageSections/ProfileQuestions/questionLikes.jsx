import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ImageBackground } from "react-native";
import background from "../../../../../assets/images/header2.png";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AllQuestionLikes from "./allQuestionLikes";

const QuestionLikes = () => {
  const navigation = useNavigation();

  // Function to navigate back to the Profile screen
  const handleGoBack = () => {
    navigation.navigate("Profile");
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        {/* Background image */}
        <ImageBackground
          source={background}
          style={styles.backgroundImage}
        />

        {/* Go back button */}
        <Ionicons
          style={styles.goBackButton}
          name="return-down-back"
          size={24}
          color="black"
          onPress={handleGoBack}
        />

        {/* Welcome content */}
        <View style={styles.welcomeContentContainer}>
          <View>
            <Text style={styles.titleText}>Vragen</Text>
            <Text style={styles.descriptionText}>
              Bekijk al je favoriete vragen!
            </Text>
          </View>

          {/* Question icon */}
          <MaterialCommunityIcons
            style={styles.questionIcon}
            name="frequently-asked-questions"
            size={30}
            color="white"
          />
        </View>

        {/* Content container for question likes */}
        <View style={styles.questionContentContainer}>
          <AllQuestionLikes />
        </View>
      </View>
    </ScrollView>
  );
};

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
  titleText: {
    fontFamily: "AvenirNext-Bold",
    color: "#3584fc", // Light blue -- Primary color
    fontSize: 30,
  },
  descriptionText: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658", // Dark blue -- Secondary color (for text)
    fontSize: 12,
    fontWeight: "400",
    marginBottom: 5,
  },
  questionIcon: {
    position: "absolute",
    top: 10,
    right: 15,
  },
  goBackButton: {
    fontFamily: "AvenirNext-Bold",
    color: "white",
    position: "absolute",
    top: 50,
    left: 20,
  },
  questionContentContainer: {
    width: "90%",
  },
});

export default QuestionLikes;
