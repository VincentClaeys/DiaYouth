import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Supabase utility
import { supabase } from "../../utils/supabase";

// Custom components
import AllQuestionsSection from "./QuestionPageSections/allQuestionsSection";
import AddQuestionSection from "./QuestionPageSections/addQuestionSection";
import AllCategories from "./QuestionPageSections/allCategories";

// Background image
import background from "../../../assets/images/header2.png";

const QuestionPage = ({ route }) => {
  const [userId, setUserId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { category: initialCategory } = route.params || {};
  const navigation = useNavigation();

  // Function to navigate to profile likes
  const navigateToProfileLikes = () => {
    navigation.navigate("QuestionLikes");
  };

  // Effect to set initial category if provided
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Effect to fetch user information
  useEffect(() => {
    const fetchUsername = async () => {
      const { data } = await supabase.auth.getUser();
      if (data) {
        setUserId(data.user.id);
      }
    };
    fetchUsername();
  }, []);

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Background image */}
        <ImageBackground source={background} style={styles.backgroundImage} />

        {/* Welcome section */}
        <View style={styles.welcomeContainer}>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeText}>Vragen?</Text>
            <Text style={styles.welcomeDescription}>
              Ze worden hier met plezier beantwoord!
            </Text>
          </View>
          {/* Profile navigation button */}
          <MaterialCommunityIcons
            style={styles.profileButton}
            onPress={navigateToProfileLikes}
            name="frequently-asked-questions"
            size={30}
            color="white"
          />
        </View>

        {/* Main content sections */}
        <View style={styles.questionContentContainer}>
        <AddQuestionSection />
          <AllCategories onSelectCategory={setSelectedCategory} />
          <AllQuestionsSection selectedCategory={selectedCategory} />
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
  welcomeContainer: {
    flexDirection: "row",
    marginTop: 100,
    justifyContent: "space-between",
    width: "90%",
    alignItems: "center",
  },
  welcomeTextContainer: {
    flexDirection: "column",
    marginLeft: 10,
  },
  welcomeText: {
    fontFamily: "AvenirNext-Bold",
    color: "#3584fc",
    fontSize: 30,
  },
  welcomeDescription: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 12,
    fontWeight: "400",
    marginBottom: 5,
  },
  profileButton: {
    marginRight: 5,
    marginBottom: 15,
  },
  questionContentContainer: {
    width: "90%",
  },
});

export default QuestionPage;
