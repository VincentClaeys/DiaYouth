import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { supabase } from "../../../../utils/supabase";
import QuestionModal from "../../../QuestionPage/QuestionPageSections/QuestionModal";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { Avatar } from "react-native-elements";
import { SUPABASE_URL } from "@env";
import UpdateQuestion from "../../../QuestionPage/QuestionPageSections/updateQuestion";

const AllQuestionSubmissions = ({ selectedCategory }) => {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userId, setUserId] = useState("");
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Fetch user ID on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (user) setUserId(user.id);
      } catch (error) {
        console.error("Error fetching user:", error.message);
      }
    };
    fetchUser();
  }, []);

  // Function to fetch questions based on selected category
  const fetchQuestions = async () => {
    let query = supabase
    .from("questions")
    .select("question_text, anonymous, user_id, id, profiles ( id, username, avatar_url ), category, question_categories ( id, name, color )")
    .eq("user_id", userId);

    if (selectedCategory && selectedCategory.length > 0) {
      query = query.in("category", selectedCategory);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching questions:", error);
      return [];
    }
    setQuestions(data);
  };

  // Subscribe to real-time updates for questions and fetch them when user ID is available
  useEffect(() => {
    if (userId) {
      fetchQuestions();
      supabase.channel("questions").on("postgres_changes", { event: "*", schema: "public", table: "questions" }, fetchQuestions).subscribe();
    }
  }, [userId]);

  // Delete a question
  const handleDeleteQuestion = async (question) => {
    try {
      await supabase.from("questions").delete().eq("id", question.id);
      fetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error.message);
    }
  };

  // Open modal with question details
  const handleQuestionPress = (question) => {
    setSelectedQuestion(question);
    setModalVisible(true);
  };

  // Open modal for editing a question
  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setModalVisible(true);
  };

  // Close modal and reset selected question
  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedQuestion(null);
    setEditingQuestion(null);
  };

  // Main component render
  return (
    <View style={styles.container}>
      {/* Header content */}
      <View style={styles.headerContent}>
        <View>
          <View style={styles.headerTitle}>
            <Text style={styles.headerText}>Ingezonden vragen</Text>
          </View>
          <Text style={styles.headerDescription}>
           Bekijk, wijzig of verwijder je ingezonden vragen.
          </Text>
        </View>
      </View>
      {/* List of questions */}
      {questions.map((question, index) => (
        <View key={index} style={styles.questionCard}>
          {/* Question header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {/* Profile photo */}
              <View style={styles.avatar}>
                <Avatar
                  size={75}
                  style={styles.avatar}
                  rounded
                  source={{ uri: `${SUPABASE_URL}/storage/v1/object/public/${question.profiles.avatar_url}` }}
                />
              </View>
              {/* User info */}
              <View style={styles.userInfo}>
                <Text style={styles.username}>
                  {question.anonymous === "true"? "Anonymous" : question.profiles.username}
                </Text>
                <Text style={styles.datePublished}>10/12/2021</Text>
              </View>
            </View>
            {/* Category badge */}
            <View style={styles.headerRight}>
              <View style={[styles.categoryBadge, { backgroundColor: question.question_categories.color }]}>
                <Text style={styles.categoryName}>
                  {question.question_categories.name}
                </Text>
              </View>
            </View>
          </View>
          {/* Question content */}
          <View style={styles.questionContent}>
            <Text style={styles.questionText}>{question.question_text}</Text>
          </View>
          {/* Actions */}
          <View style={styles.actions}>
            <View style={styles.actionsLeft}>
              {/* Message icon */}
              <View style={styles.actionItemMessage}>
                <TouchableOpacity onPress={() => handleQuestionPress(question)}>
                  <Feather name="message-square" size={20} color="#213658" />
                </TouchableOpacity>
              </View>
            </View>
            {/* Edit and delete icons */}
            <View style={styles.actionItem}>
              {userId === question.user_id && (
                <>
                  <TouchableOpacity onPress={() => handleDeleteQuestion(question)}>
                    <MaterialCommunityIcons name="delete" size={22} color="red" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleEditQuestion(question)}>
                    <MaterialCommunityIcons name="pencil" size={22} color="#213658" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      ))}
      {/* Modals */}
      {selectedQuestion && (
        <QuestionModal
          visible={modalVisible}
          onClose={handleCloseModal}
          question={selectedQuestion}
        />
      )}
      {editingQuestion && (
        <UpdateQuestion
          visible={modalVisible}
          onClose={handleCloseModal}
          question={editingQuestion}
          isEditing={true}
        />
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 10,
    marginBottom: 20,
  },
  headerTitle: {
    marginBottom: 5,
  },
  headerText: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 20,
  },
  headerDescription: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 10,
    fontWeight: "400",
  },
  questionCard: {
    margin: 7,
    borderRadius: 9,
    backgroundColor: "#FDFDFD",
    borderColor: "#707070",
    borderWidth: 0.2,
  },
  header: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc",
    marginRight: 15,
  },
  userInfo: {
    flexDirection: "column",
  },
  username: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 13,
    fontWeight: "700",
  },
  datePublished: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 8,
    fontWeight: "400",
  },
  categoryBadge: {
    marginTop: 2,
    paddingVertical: 2.5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  categoryName: {
    fontFamily: "AvenirNext-Bold",
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "400",
  },
  questionContent: {
    paddingLeft: 20,
    marginTop: 10,
    marginBottom: 15,
    width: "93%",
  },
  questionText: {
    fontFamily: "AvenirNext-Regular",
    color: "#213658",
    fontSize: 14,
    fontWeight: "500",
  },
  actions: {
    display: "flex",
    flexDirection: "row",
    paddingBottom: 15,
    paddingTop: 15,
    justifyContent: "space-between",
    marginTop: 10,
    borderTopWidth: 0.2,
    marginLeft: 20,
    marginRight: 20,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionItemMessage: {
    marginRight: 10,
  },
});

export default AllQuestionSubmissions;
