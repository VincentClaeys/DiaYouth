// Import React Native components first
import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "react-native-elements";

// Import specific components and utilities next
import { useNavigation } from "@react-navigation/native";

// Import images
import backgroundFAQ from "../../../../assets/images/FAQ.png";
import backgroundQuestions from "../../../../assets/images/asking.png";
import backgroundNewUser from "../../../../assets/images/NewUser.png";

const PopulairSectionHomescreen = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([
    {
      name: "Q&A",
      description: "Beantwoord en stel vragen met lotgenoten.",
      color: "#FAF8FC",
      image: backgroundQuestions,
      id: "1",
    },
    {
      name: "FAQ",
      description: "Meest gestelde vragen over diabetes.",
      color: "#FAF8FC",
      image: backgroundFAQ,
      id: "2",
    },
    {
      name: "NIEUW?",
      description: "Stel je vragen aan onze mystery guest!",
      color: "#FAF8FC",
      image: backgroundNewUser,
      id: "3",
    },
  ]);

  // Define actions for each category card
  const cardActions = {
    "1": () => navigation.navigate("Questions"),
    "2": () => navigation.navigate("FAQDetail"),
    "3": () => navigation.navigate("NewUserDetail"), 
  };

  // Function to get image wrapper style based on category ID
  const getImageWrapperStyle = (id) => {
    switch(id) {
      case "1":
        return { left: 75, top: 50 };
      case "2":
        return { left: 60, top: 70 };
      case "3":
        return { left: 90, top: 62 };
      default:
        return {};
    }
  };

  // Component to render each category card
  const RenderCard = ({ item }) => (
    <TouchableOpacity onPress={cardActions[item.id]}>
      <View style={[styles.cardContainer, { backgroundColor: item.color }]}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.subtitle}>{item.description}</Text>
        </View>
        <View style={[styles.imageWrapper, getImageWrapperStyle(item.id)]}>
          <Image source={item.image} style={styles.image} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionTitle}>
        <Text style={styles.sectionHeaderText}>Populair</Text>
      </View>
      <View style={styles.cardsContainer}>
        <FlatList
          data={categories}
          horizontal
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <RenderCard item={item} />}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 40,
    display: "flex",
    flexDirection: "column",
    marginLeft: 10,
  },
  cardContainer: {
    margin: 7,
    width: 210,
    backgroundColor: "#F8F8F8",
    borderRadius: 9,
    flexDirection: "column",
    alignItems: "center",
    height: 220,
    marginRight: 20,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 1.84,
    elevation: 1,
  },
  imageWrapper: {
    position: "absolute",
  },
  image: {
    width: 170,
    height: 170,
  },
  textContainer: {
    padding: 20,
    width: "100%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3584FC",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 11.5,
    fontFamily: "AvenirNext-Bold",
    fontWeight: "400",
    color: "#3584FC",
    width: 100,
  },
  sectionTitle: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  sectionHeaderText: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 20,
  },
  cardsContainer: {
    marginTop: 10,
    height: 230,
  },
});

export default PopulairSectionHomescreen;
