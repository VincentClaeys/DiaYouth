import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// FAQ data array
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

const FAQDetail = () => {
  const navigation = useNavigation();
  const [expandedItem, setExpandedItem] = useState(null);


  // Function to toggle the expansion of a FAQ item
  const toggleExpand = (id) => {
    setExpandedItem((prevExpandedItem) =>
      prevExpandedItem === id ? null : id
    );
  };

  // Function to navigate back to the Home screen
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
            <Text style={styles.title}>FAQ</Text>
            <Text style={styles.subtitle}>
              De 5 meest gestelde vragen over diabetes
            </Text>
          </View>

          <FlatList
            data={faqData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.faqItem}>
                <TouchableOpacity
                  onPress={() => toggleExpand(item.id)}
                  style={styles.questionContainer}
                >
                  <Text style={styles.question}>{item.question}</Text>
                  <Ionicons
                    name={
                      expandedItem === item.id ? "chevron-up" : "chevron-down"
                    }
                    size={24}
                    color="#213658"
                  />
                </TouchableOpacity>
                {expandedItem === item.id && (
                  <Text style={styles.answer}>{item.answer}</Text>
                )}
              </View>
            )}
          />
          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerText}>
              Deze antwoorden zijn gecontroleerd en beantwoord door experts en
              mensen met ervaring. Bij DiaYouth staan we voor correcte
              informatie en ondersteuning. Raadpleeg altijd een medisch
              professional voor persoonlijk advies.
            </Text>
          </View>
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
  subtitle: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 11,
    fontWeight: "400",
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
});

export default FAQDetail;
