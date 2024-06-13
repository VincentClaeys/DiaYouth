import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { supabase } from "../../../utils/supabase";
import { MaterialIcons } from "@expo/vector-icons";

// Component to display all categories and show a disclaimer modal
const AllCategories = ({ onSelectCategory }) => {
  const [categories, setCategories] = useState([]); // State for storing categories
  const [selectedCategories, setSelectedCategories] = useState([]); // State for storing selected categories
  const [modalVisible, setModalVisible] = useState(false); // State to manage the visibility of the disclaimer modal

  // Fetch categories from Supabase
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
      .from("question_categories")
      .select("name, id, color"); // Select only required fields
      if (error) {
        throw error;
      }
      setCategories(data); // Update state with fetched categories
    } catch (error) {
      console.error("Error fetching categories:", error.message);
    }
  };

  // Handle category selection, update selected categories and call callback function
  const handleSelectCategory = (category) => {
    let newSelectedCategories = [...selectedCategories];
    if (newSelectedCategories.includes(category.id)) {
      newSelectedCategories = newSelectedCategories.filter(
        (catId) => catId!== category.id
      );
    } else {
      newSelectedCategories.push(category.id);
    }
    setSelectedCategories(newSelectedCategories);
    onSelectCategory(newSelectedCategories); // Call the callback function with the new selected categories
  };

  // Component representing an individual category card
  const CategoryCard = ({ name, color, onPress, isSelected }) => {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.categoryCard,
          { backgroundColor: color },
          isSelected && styles.selectedCategoryCard,
        ]}
      >
        <Text style={styles.categoryName}>{name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Section to display categories */}
      <View style={styles.questionsSection}>
        <View style={styles.questionContentContainer}>
          <View>
            <Text style={styles.title}>Categorieën</Text>
          </View>
          {/* Displays a disclaimer icon and text when clicked */}
          <TouchableOpacity
            style={styles.disclaimerContainer}
            onPress={() => setModalVisible(true)}
          >
            <MaterialIcons name="info" size={14} color="#213658" />
            <Text style={styles.textDisclaimer}>disclaimer</Text>
          </TouchableOpacity>
        </View>
        {/* List of categories */}
        <View style={styles.allCategoriesContainer}>
          <FlatList
            data={categories}
            horizontal
            keyExtractor={(item) => item.id?.toString() || "all"}
            renderItem={({ item }) => (
              <CategoryCard
                key={item.id}
                name={item.name}
                color={item.color}
                onPress={() => handleSelectCategory(item)}
                isSelected={selectedCategories.includes(item.id)}
              />
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </View>

      {/* Disclaimer modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <Pressable
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <MaterialIcons name="close" size={24} color="#213658" />
            </Pressable>
            <Text style={styles.modalTitle}>Disclaimer</Text>
            <Text style={styles.modalContent}>
            DiaYouth staat voor betrouwbaarheid en correctheid. Gebruikers dienen altijd nauwkeurig en correct te antwoorden. Bij twijfels en voor specifiek medisch advies adviseren wij om contact op te nemen met een gekwalificeerde gezondheidsprofessional. 
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    paddingHorizontal: 10,
    marginBottom: 30,
  },
  questionContentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontFamily: "AvenirNext-Bold",
    fontSize: 20,
    marginBottom: 10,
    color: "#213658",
  },
  disclaimerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  textDisclaimer: {
    fontFamily: "AvenirNext-Bold",
    fontSize: 10,
    color: "#213658",
    marginLeft: 5,
    fontWeight: "400",
  },
  categoryCard: {
    margin: 4,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedCategoryCard: {
    borderWidth: 2,
    borderColor: "#3584FC",
  },
  categoryName: {
    fontFamily: "AvenirNext-Bold",
    color: "white",
    fontSize: 12,
  },
  btnShowAllQuestions: {
    marginTop: 15,
  },
  showAllQuestionsText: {
    fontFamily: "AvenirNext-Bold",
    fontSize: 9,
    color: "#213658",
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  modalTitle: {
    fontFamily: "AvenirNext-Bold",
    fontSize: 18,
    color: "#213658",
    marginBottom: 10,
  },
  modalContent: {
    fontFamily: "AvenirNext-Bold",
    fontSize: 12,
    color: "#213658",
    fontWeight: "400",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});

export default AllCategories;
