import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import specialGuestImage from "../../../../assets/images/NewUser.png";
import { Image } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
const faqData = [
  {
    id: "1",
    question: "Wat is diabetes?",
    answer:
      "Diabetes is een chronische ziekte waarbij het lichaam niet in staat is om de bloedsuikerspiegel goed te reguleren. Dit komt doordat het lichaam onvoldoende insuline aanmaakt of de insuline niet goed kan gebruiken.",
  },
  {
    id: "2",
    question: "Wat zijn de verschillende types diabetes?",
    answer:
      "De belangrijkste typen diabetes zijn type 1, type 2 en zwangerschapsdiabetes. Type 1 diabetes wordt veroorzaakt door een auto-immuunreactie die de insulineproducerende cellen vernietigt. Type 2 diabetes ontstaat wanneer het lichaam resistent wordt tegen insuline of niet genoeg insuline aanmaakt. Zwangerschapsdiabetes komt voor tijdens de zwangerschap en verdwijnt meestal na de bevalling.",
  },
  {
    id: "3",
    question: "Hoe wordt diabetes behandeld?",
    answer:
      "Diabetes wordt behandeld door middel van een combinatie van medicatie (zoals insuline of orale medicatie), een gezond dieet en regelmatige lichaamsbeweging. Het doel van de behandeling is om de bloedsuikerspiegel binnen het normale bereik te houden en complicaties te voorkomen.",
  },
  {
    id: "4",
    question: "Wat zijn de symptomen van diabetes?",
    answer:
      "Veelvoorkomende symptomen van diabetes zijn vaak moeten plassen, extreme dorst, onverklaarbaar gewichtsverlies, vermoeidheid, wazig zien en langzame wondgenezing. Het is belangrijk om een arts te raadplegen als je deze symptomen ervaart.",
  },
  {
    id: "5",
    question: "Kan diabetes worden voorkomen?",
    answer:
      "Type 2 diabetes kan vaak worden voorkomen of uitgesteld door een gezonde levensstijl aan te nemen, zoals een uitgebalanceerd dieet, regelmatige lichaamsbeweging en het handhaven van een gezond gewicht. Hoewel type 1 diabetes niet kan worden voorkomen, kunnen gezonde gewoonten helpen bij het beheersen van de ziekte.",
  },
];

const NewUserDetail = () => {
  const navigation = useNavigation();
  const [expandedItem, setExpandedItem] = useState(null);

  const toggleExpand = (id) => {
    setExpandedItem((prevExpandedItem) =>
      prevExpandedItem === id ? null : id
    );
  };

  const navigateHome = () => {
    navigation.navigate("Home");
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.goBackContainer}>
          <TouchableOpacity style={styles.backButton} onPress={navigateHome}>
            <Ionicons name="return-down-back" size={24} color="#3584FC" />
          </TouchableOpacity>
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.contentHeading}>
            <Text style={styles.title}>
             Speciale gast!
            </Text>
      
            <Text style={styles.subtitleTitle}>
              Kom langs en ontdek samen wie het is!
            </Text>
            
         
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
            <Text style={styles.detailsEventTitle}>Evenement details</Text>
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
          {/* <View style={styles.imageContainer} >
            <Image source={specialGuestImage} style={styles.image} />
            </View> */}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  contentContainer: {
    flex: 1,
    marginTop: 40,
  },
  contentHeading: {
    marginBottom: 40,
  },
  title: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 30,
  },
  subtitleTitle: {
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



  faqItem: {
    marginBottom: 15,
    borderBottomWidth: 0.2,
    paddingBottom: 15,
  },
  questionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  question: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3584FC",
    flex: 1,
  },
  answer: {
    fontSize: 11,
    color: "#213658",
    marginTop: 15,
    fontFamily: "AvenirNext-Bold",
    fontWeight: "400",
  },
  disclaimerContainer: {
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    position: "absolute",
    bottom: 20,
  },
  disclaimerText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },

//   imageContainer: {
//     position: "absolute",
//     bottom: 0,
//     left: 150,
    
//     },

//     image: {
//     width: 300,
//     height: 300,
  

//   },
detailsEventTitle: {

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
