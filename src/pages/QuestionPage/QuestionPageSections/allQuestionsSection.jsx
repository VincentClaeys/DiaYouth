import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { supabase } from "../../../utils/supabase";
import QuestionModal from "./QuestionModal";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import blankProfilePhoto from "../../../../assets/images/blank_profile.jpg";
import { Avatar } from "react-native-elements";
import { FontAwesome } from "@expo/vector-icons";
import { SUPABASE_URL } from "@env";
import { Fontisto } from "@expo/vector-icons";
import UpdateQuestion from "./updateQuestion";

const AllQuestionsSection = ({ selectedCategory }) => {
  const [questions, setQuestions] = useState([]);
  const [likedQuestions, setLikedQuestions] = useState([]);
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userId, setUserId] = useState("");
  const [editingQuestion, setEditingQuestion] = useState(null); // State to track the question being edited

  useEffect(() => {
    fetchQuestions();
  }, [selectedCategory]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) {
          throw error;
        }
        if (user) {
          setUserId(user.id);
          fetchSavedQuestions(user.id);
          fetchLikedQuestions(user.id);
        }
      } catch (error) {
        console.error("Error fetching user:", error.message);
      }
    };

    fetchUser();
  }, []);

  const fetchQuestions = async () => {
    let query = supabase
      .from("questions")
      .select(
        "question_text, anonymous, user_id, id, profiles ( id, username, avatar_url ), category, question_categories ( id, name, color )"
      );

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

  const fetchSavedQuestions = async (userId) => {
    const { data, error } = await supabase
      .from("saved_questions")
      .select("question_id")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching saved questions:", error);
      return;
    }

    const savedQuestionIds = data.map((like) => like.question_id);
    setSavedQuestions(savedQuestionIds);
  };

  const fetchLikedQuestions = async (userId) => {
    const { data, error } = await supabase
      .from("likes_question")
      .select("question_id")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching liked questions:", error);
      return;
    }

    const likedQuestionIds = data.map((like) => like.question_id);
    setLikedQuestions(likedQuestionIds);
  };

  const handleDeleteQuestion = async (question) => {
    try {
      await supabase.from("questions").delete().eq("id", question.id);
      fetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error.message);
    }
  };

  const handleInserts = () => {
    fetchQuestions();
  };

  useEffect(() => {
    const subscription = supabase
      .channel("questions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "questions" },
        handleInserts
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

  // Close the modal and reset the selected question state

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedQuestion(null);
    setEditingQuestion(null); // Reset the editing question state when closing the modal
  };

  // Toggle save on a question

  const toggleSave = async (question) => {
    const { data, error } = await supabase
      .from("saved_questions")
      .select("id")
      .eq("user_id", userId)
      .eq("question_id", question.id);

    if (error) {
      console.error("Error fetching saved questions:", error);
      return;
    }

    if (data.length > 0) {
      await supabase
        .from("saved_questions")
        .delete()
        .eq("user_id", userId)
        .eq("question_id", question.id);
      setSavedQuestions(savedQuestions.filter((id) => id !== question.id));
    } else {
      await supabase
        .from("saved_questions")
        .insert([{ user_id: userId, question_id: question.id }]);
      setSavedQuestions([...savedQuestions, question.id]);
    }
  };

  // Toggle like on a question

  const toggleLike = async (question) => {
    const { data, error } = await supabase
     .from("likes_question")
     .select("id")
     .eq("user_id", userId)
     .eq("question_id", question.id);

    if (error) {
      console.error("Error fetching liked questions:", error);
      return;
    }

    if (data.length > 0) {
      await supabase
       .from("likes_question")
       .delete()
       .eq("user_id", userId)
       .eq("question_id", question.id);
      setLikedQuestions(likedQuestions.filter((id) => id!== question.id));
    } else {
      await supabase
       .from("likes_question")
       .insert([{ user_id: userId, question_id: question.id }]);
      setLikedQuestions([...likedQuestions, question.id]);
    }
  };

  return (
    <View style={styles.container}>
      {questions.map((question, index) => (
        <View key={index} style={styles.questionCard}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.avatarContainer}>
                <Avatar
                  size={75}
                  style={styles.avatar}
                  rounded
                  source={
                    question.profiles.avatar_url
                     ? {
                          uri: `${SUPABASE_URL}/storage/v1/object/public/${question.profiles.avatar_url}`,
                        }
                      : blankProfilePhoto
                  }
                />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.username}>
                  {question.anonymous === "true"
                   ? "Anonymous"
                    : question.profiles.username}
                </Text>
                <Text style={styles.datePublished}>10/12/2021</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <View style={[styles.categoryBadge, { backgroundColor: question.question_categories.color }]}>
                <Text style={styles.categoryName}>
                  {question.question_categories.name}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.questionContent}>
            <Text style={styles.questionText}>{question.question_text}</Text>
          </View>
          <View style={styles.actions}>
            <View style={styles.actionsLeft}>
              <View style={styles.actionItemLike}>
                <TouchableOpacity onPress={() => toggleLike(question)}>
                  {likedQuestions.includes(question.id)? (
                    <Fontisto name="heart" size={20} color="#213658" />
                  ) : (
                    <FontAwesome name="heart-o" size={20} color="#213658" />
                  )}
                </TouchableOpacity>
              </View>
              <View style={styles.actionItemMessage}>
                <TouchableOpacity onPress={() => handleQuestionPress(question)}>
                  <Feather name="message-square" size={20} color="#213658" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.actionItem}>
              <TouchableOpacity onPress={() => toggleSave(question)}>
                {savedQuestions.includes(question.id)? (
                  <MaterialCommunityIcons name="bookmark" size={22} color="#213658" />
                ) : (
                  <MaterialCommunityIcons name="bookmark-outline" size={22} color="#213658" />
                )}
              </TouchableOpacity>
              {userId === question.user_id && (
                <TouchableOpacity onPress={() => handleDeleteQuestion(question)}>
                  <MaterialCommunityIcons name="delete" size={22} color="red" />
                </TouchableOpacity>
              )}
              {userId === question.user_id && (
                <TouchableOpacity onPress={() => handleEditQuestion(question)}>
                  <MaterialCommunityIcons name="pencil" size={22} color="#213658" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      ))}
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
  datePublished: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 8,
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
  actionItemLike: {
    marginRight: 10,
  },

  actionsLeft: {
    display: "flex",
    flexDirection: "row",
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  actionText: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 11,
    fontWeight: "400",
  },
});

export default AllQuestionsSection;
