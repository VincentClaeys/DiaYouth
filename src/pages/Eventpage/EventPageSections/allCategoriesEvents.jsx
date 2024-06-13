import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { supabase } from "../../../utils/supabase";

const AllCategoriesEvents = ({ onSelectCategory }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("event_categories")
        .select("name, id, color");
      if (error) {
        throw error;
      }
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error.message);
    }
  };

  const handleSelectCategory = (category) => {
    let newSelectedCategories = [...selectedCategories];
    if (newSelectedCategories.includes(category.name)) {
      newSelectedCategories = newSelectedCategories.filter(
        (cat) => cat !== category.name
      );
    } else {
      newSelectedCategories.push(category.name);
    }
    setSelectedCategories(newSelectedCategories);
    onSelectCategory(newSelectedCategories);
  };

  const CategoryCard = ({ name, color, onPress, isSelected }) => {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.categoryCard,
          { backgroundColor: color },
          isSelected && styles.selectedCategoryCard
        ]}
      >
        <Text style={styles.categoryName}>{name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.gridContainer}>
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            name={category.name}
            color={category.color}
            onPress={() => handleSelectCategory(category)}
            isSelected={selectedCategories.includes(category.name)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
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
});

export default AllCategoriesEvents;
