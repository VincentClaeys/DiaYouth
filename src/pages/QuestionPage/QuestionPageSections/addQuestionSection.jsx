import React, { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "../../../utils/supabase";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Alert,
  TouchableOpacity,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { CheckBox } from "@rneui/themed";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

// AddQuestionSection component to add a question
const AddQuestionSection = () => {
  const [visible, setVisible] = useState(false);
  const [userId, setUserId] = useState("");
  const [question, setQuestion] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [aiAnswer, setAiAnswer] = useState("");

  const toggleDialog = () => setVisible(!visible);

  // Fetch the user and set the user id
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) throw error;
        if (user) setUserId(user.id);
      } catch (error) {
        console.error("Error fetching user:", error.message);
      }
    };
    fetchUser();
  }, []);

  // all the categories

  const categories = {
    algemeen: 1,
    "Diabetes vs puberteit": 2,
    Medicatie: 3,
    "Sensor en pomp": 4,
  };

  // Function to submit the question
  const submitQuestion = async (question) => {
    try {
      // Fetch the AI answer using the ChatGPT API
      const chatGptOptions = {
        method: "POST",
        url: "https://openai-api-gpt-3-5-turbo.p.rapidapi.com/api/v1/chat/completions",
        headers: {
          "x-rapidapi-key":
            "c6a1eda06amshca85d6b81571302p130628jsne64d037aeb6e",
          "x-rapidapi-host": "openai-api-gpt-3-5-turbo.p.rapidapi.com",
          "Content-Type": "application/json",
        },
        data: {
          model: "gemma-7b",
          messages: [
            {
              role: "assistant",
              content:
                "antwoord altijd in het nederlands, hou het antwoord zo kort en duidelijk mogelijk",
            },
            {
              role: "user",
              content: question,
            },
          ],
          temperature: 0.5,
          top_p: 0.95,
          max_tokens: -1,
          use_cache: false,
          stream: false,
        },
      };
      const chatGptResponse = await axios.request(chatGptOptions);
      const chatGptMessage = chatGptResponse.data.choices[0].message.content;
      console.log("ChatGPT response:", chatGptMessage);

      //  Insert the question and AI answer into the database
      const categoryId = categories[selectedCategory];
      const { data, error } = await supabase.from("questions").insert([
        {
          question_text: question,
          ai_answer: chatGptMessage, // Store the AI answer in the database
          user_id: userId,
          category: categoryId,
          anonymous: isAnonymous,
        },
      ]);
      if (error) throw error;

      Alert.alert("Jouw vraag en antwoord zijn succesvol doorgestuurd!");
      console.log("Question submitted successfully:", data);

      setQuestion('');
      setSelectedCategory('');
      setIsAnonymous(false);
      setVisible(false);
    } catch (error) {
      console.error("Error submitting question:", error.message);
    }
  };
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <View style={styles.headerTitle}>
            <MaterialCommunityIcons
              name="comment-question"
              size={20}
              color="#213658"
            />
            <Text style={styles.headerText}>Durf te vragen!</Text>
          </View>
          <Text style={styles.headerDescription}>Samen helpen we elkaar.</Text>
        </View>

        <View style={styles.iconContainer}>
          <Ionicons
            onPress={toggleDialog}
            name="add-circle"
            size={30}
            color="#3584FC"
          />
        </View>
      </View>
      <Modal visible={visible} transparent={true} animationType="slide">
        <TouchableWithoutFeedback onPress={toggleDialog}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              style={styles.modalContainer}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Stel jouw vraag!</Text>
                  <Text style={styles.modalDescription}>
                    Kies een passende categorie voor jouw vraag.
                  </Text>
                  <View style={styles.categoryContainer}>
                    {Object.keys(categories).map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryButton,
                          selectedCategory === category &&
                            styles.selectedCategoryButton,
                        ]}
                        onPress={() => handleCategorySelect(category)}
                      >
                        <Text
                          style={[
                            styles.categoryButtonText,
                            selectedCategory === category &&
                              styles.selectedCategoryText,
                          ]}
                        >
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.questionLabel}>Wat wil je vragen?</Text>
                  <TextInput
                    placeholder="vraag maar raak!"
                    style={styles.questionInput}
                    value={question}
                    onChangeText={setQuestion}
                    multiline
                  />
                  <Text style={styles.anonymousLabel}>Anoniem blijven?</Text>
                  <View style={styles.checkboxContainer}>
                    <CheckBox
                      checked={isAnonymous}
                      onPress={() => setIsAnonymous(!isAnonymous)}
                    />
                    <Text style={styles.checkboxLabel}>
                      ja, ik wil anoniem blijven
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      question.trim().length === 0 && styles.disabledButton,
                    ]}
                    onPress={() =>
                      question.trim().length > 0 && submitQuestion(question)
                    }
                    disabled={question.trim().length === 0}
                  >
                    <Text style={styles.submitButtonText}>verstuur</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    marginLeft: 10,
  },
  iconContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0.5, height: 0.5 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  headerText: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 20,
    marginLeft: 10,
  },
  headerDescription: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 10,
    fontWeight: "400",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "90%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  modalContent: {
    padding: 10,
  },
  modalTitle: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 15,
    fontWeight: "700",
  },
  modalDescription: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 10,
  },

  questionLabel: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 20,
  },
  questionInput: {
    width: "100%",
    borderBottomColor: "#0D397D",
    borderBottomWidth: 0.4,
    padding: 10,
    fontFamily: "AvenirNext-Bold",
    fontSize: 11,
    fontWeight: "400",
  },
  anonymousLabel: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 20,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxLabel: {
    fontFamily: "AvenirNext-Bold",
    fontSize: 10,
    color: "#213658",
    fontWeight: "400",
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
    marginTop: 20,
  },
  categoryButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginVertical: 5,
    borderRadius: 5,
    marginRight: 10,
  },
  selectedCategoryButton: {
    backgroundColor: "#007bff",
  },
  categoryButtonText: {
    fontFamily: "AvenirNext-Bold",
    fontSize: 12,
    fontWeight: "400",
  },
  selectedCategoryText: {
    color: "#fff",
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: "#3584fc",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  submitButtonText: {
    fontFamily: "AvenirNext-Bold",
    fontSize: 10,
    color: "white",
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default AddQuestionSection;
