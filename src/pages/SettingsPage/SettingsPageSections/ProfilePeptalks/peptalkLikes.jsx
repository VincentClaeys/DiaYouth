import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { supabase } from "../../../../utils/supabase";
import { ListItem, Button, Icon } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import { ImageBackground } from "react-native";
import background from "../../../../../assets/images/header2.png";
import { Fontisto } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import AllPeptalkLikes from "./allPeptalkLikes";

const PeptalkLikes = () => {
  const [userId, setUserId] = useState("");
  const [peptalks, setPeptalks] = useState([]);
  const navigation = useNavigation();
  
  useEffect(() => {
    const fetchUsername = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user.id);
    };

    fetchUsername();
  }, []);

  useEffect(() => {
    const fetchPeptalks = async () => {
      try {
        if (!userId) {
          console.log("User ID not set yet");
          return; // Return early if userId is not set yet
        }

        const { data, error } = await supabase
          .from("likes")
          .select("id, user_id,quote_id")

          .eq("user_id", userId);

        if (error) {
          throw error;
        }

        if (data) {
          setPeptalks(data);
        }
      } catch (error) {
        console.error("Error fetching quotes:", error.message);
      }
    };

    if (userId) {
      // Controleer of userId is ingesteld voordat je fetchQuotes aanroept
      fetchPeptalks();
    }
  }, [userId]); 


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
            <Text style={styles.welcomeText}>Peptalk</Text>
            <Text style={styles.welcomeTextDescription}>
              Hoe leuk! Je eigen peptalk-wall!
            </Text>
          </View>

          <Fontisto
            style={styles.peptalkLike}
            name="heart"
            size={30}
            color="white"
          />
        </View>

        <View style={styles.peptalkContentContainer}>
          <AllPeptalkLikes />
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
  peptalkLike: {
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

  peptalkContentContainer: {
    width: "90%",
  },
});

export default PeptalkLikes;
