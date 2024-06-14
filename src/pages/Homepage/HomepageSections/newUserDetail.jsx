import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";


const NewUserDetail = () => {
  const navigation = useNavigation();


  // Navigation function to go back home
  const navigateHome = () => {
    navigation.navigate("Home");
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={navigateHome}>
          <Ionicons name="return-down-back" size={24} color="#3584FC" />
        </TouchableOpacity>
      </View>
      <View style={styles.mainContent}>
        <View style={styles.headingContainer}>
          <Text style={styles.title}>Speciale gast!</Text>
          <Text style={styles.subtitle}>Kom langs en ontdek samen wie het is!</Text>
        </View>
        <View style={styles.detailsContainer}>
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              Volgende woensdagmiddag tussen 14-16u komt er een special guest!
              We kunnen nog niet zeggen wie het is, enkel dat het een diabetes
              content creator is die content maakt op Instagram en TikTok.
              Kom dus zeker langs, want het is een unieke kans om al je vragen te stellen!
            </Text>
          </View>
          <Text style={styles.eventDetailsTitle}>Evenement details</Text>
          <Text style={styles.detailText}>
            <Text style={styles.boldText}>Datum: </Text> Volgende woensdag - 19 juni 2024
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.boldText}>Tijd: </Text> 14u00 - 16u00
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.boldText}>Plek: </Text> Vragen sectie van de
            app
          </Text>
        </View>
      </View>
    </View>
  );
};

// Styles object
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  headerContainer: {
    marginTop:40,
  },
  backButton: {
    alignSelf: "flex-start",   
  },
  mainContent: {
    flex: 1,
    marginTop: 40,
  },
  headingContainer: {
    marginBottom: 40,
  },
  title: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 30,
  },
  subtitle: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 11,
    fontWeight: "400",
  },
  descriptionContainer: {
    marginBottom: 20,
    borderBottomWidth: 0.2,
    paddingBottom: 20,
  },
  description: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 14,
    fontWeight: "600",
    width: "90%",
  },
  eventDetailsTitle: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
  },
  detailText: {
    fontFamily: "AvenirNext-Bold",
    fontSize: 11,
    color: "#213658",
    marginBottom: 10,
    fontWeight: "400",
  },
  boldText: {
    fontFamily: "AvenirNext-Bold",
    fontSize: 11,
    color: "#213658",
    fontWeight: "700",
  },
});

export default NewUserDetail;
