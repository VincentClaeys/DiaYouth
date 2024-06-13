import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ImageBackground } from "react-native";
import background from "../../../../../assets/images/header2.png";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AllQuestionSubmissions from "./allQuestionSubmissions";

const QuestionSubmissions = () => {
  const navigation = useNavigation();

  // Navigate back to the profile screen
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
        <ImageBackground source={background} style={styles.backgroundImage} />

        <Ionicons
          style={styles.goBackBtn}
          name="return-down-back"
          size={24}
          color="black"
          onPress={btnGoBack}
        />

        <View style={styles.welcomeContentContainer}>
          <View>
            <Text style={styles.welcomeText}>Vragen</Text>
            <Text style={styles.welcomeTextDescription}>
              Bekijk al je ingezonden vragen.
            </Text>
          </View>

          <MaterialCommunityIcons
            style={styles.questionIcon}
            name="frequently-asked-questions"
            size={30}
            color="white"
          />
        </View>

        <View style={styles.questionContentContainer}>
          <AllQuestionSubmissions />
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
  welcomeText: {
    fontFamily: "AvenirNext-Bold",
    color: "#3584fc", // Light blue -- Primary color
    fontSize: 30,
  },
  questionIcon: {
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
    color: "#213658", // Dark blue -- Secondary color (for text)
    fontSize: 12,
    fontWeight: "400",
    marginBottom: 5,
  },
  questionContentContainer: {
    width: "90%",
  },
});

export default QuestionSubmissions;
