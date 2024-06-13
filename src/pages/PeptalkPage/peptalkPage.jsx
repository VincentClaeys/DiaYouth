import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { supabase } from "../../utils/supabase";
import { useNavigation } from "@react-navigation/native";
import background from "../../../assets/images/header2.png";
import { ImageBackground } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Fontisto } from "@expo/vector-icons";
import AllPeptalksSection from "./PeptalkPageSections/allPeptalksSection";
import AddPeptalksSection from "./PeptalkPageSections/addPeptalkSection";
import QuotesComponent from "./PeptalkPageSections/test";

const PepTalkPage = () => {
  const [userId, setUserId] = useState("");
  const [quote, setQuote] = useState("");
  const navigation = useNavigation();


  const navigateToProfileLikes = () => {
    navigation.navigate('PeptalkLikes');
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
        <View style={styles.welcomeContentContainer}>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeText}>Peptalk-wall</Text>
            <Text style={styles.welcomeTextDescription}>
              Deel een quote, net zoals we cola delen.
            </Text>
          </View>
          <Fontisto
            onPress={navigateToProfileLikes}
            style={styles.peptalkLike}
            name="heart"
            size={30}
            color="white"
          />
        </View>
      
        <View style={styles.peptalkContentContainer}>
          <AddPeptalksSection />
          <AllPeptalksSection />
          {/* <QuotesComponent /> */}


    
    
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
  peptalkLike: {
    marginRight: 5,
    marginBottom: 15,
  },

  // styles for the pepTalk container en content

  peptalkContentContainer: {
    width: "90%",
  },

});

export default PepTalkPage;
