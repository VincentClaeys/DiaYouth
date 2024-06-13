// Organized imports
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { supabase } from "../../../../utils/supabase";
import QuestionModal from "../../../QuestionPage/QuestionPageSections/QuestionModal";
import UpdateQuestion from "../../../QuestionPage/QuestionPageSections/updateQuestion";
import { SUPABASE_URL } from "@env";
import { Avatar } from "react-native-elements";
import { FontAwesome, Fontisto, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import blankProfilePhoto from "../../../../../assets/images/blank_profile.jpg";

const AllQuestionLikes = ({ selectedCategory }) => {
  const [questions, setQuestions] = useState([]);
  const [likedQuestions, setLikedQuestions] = useState([]);
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userId, setUserId] = useState("");

  // Fetch user ID and initialize likes and saves on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (user) {
          setUserId(user.id);
          fetchLikedQuestions(user.id);
          fetchSavedQuestions(user.id);
        }
      } catch (error) {
        console.error("Error fetching user:", error.message);
      }
    };
    fetchUser();
  }, []);

  // Fetch questions based on liked question IDs
  const fetchQuestions = async (likedQuestionIds) => {
    let query = supabase
     .from("questions")
     .select("question_text, anonymous, user_id, id, profiles ( id, username, avatar_url ), category, question_categories ( id, name, color )")
     .in("id", likedQuestionIds);

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching questions:", error);
      return [];
    }
    setQuestions(data);
  };

  // Fetch saved questions for the current user
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

  // Fetch liked questions for the current user and update displayed questions
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
    fetchQuestions(likedQuestionIds);
  };

  // Handle deletion of a question
  const handleDeleteQuestion = async (question) => {
    try {
      await supabase.from("questions").delete().eq("id", question.id);
      fetchQuestions(likedQuestions);
    } catch (error) {
      console.error("Error deleting question:", error.message);
    }
  };

  // Re-fetch questions when new likes are inserted
  const handleInserts = () => {
    fetchQuestions(likedQuestions);
  };

  // Listen for changes in the 'questions' table and re-fetch questions accordingly
  useEffect(() => {
    const subscription = supabase
     .channel("questions")
     .on("postgres_changes", { event: "*", schema: "public", table: "questions" }, handleInserts)
     .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [likedQuestions]);

  // Open modal with question details
  const handleQuestionPress = (question) => {
    setSelectedQuestion(question);
    setModalVisible(true);
  };

  // Close modal and reset selected question
  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedQuestion(null);
  };

  // Toggle like status for a question
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
      fetchQuestions(likedQuestions.filter((id) => id!== question.id));
    } else {
      await supabase
       .from("likes_question")
       .insert([{ user_id: userId, question_id: question.id }]);
      setLikedQuestions([...likedQuestions, question.id]);
      fetchQuestions([...likedQuestions, question.id]);
    }
  };

  // Render the component
  return (
    <View style={styles.container}>
      <View style={styles.headerContent}>
        <View>
          <View style={styles.headerTitle}>
            <Text style={styles.headerText}>Favorieten</Text>
          </View>
          <Text style={styles.headerDescription}>
            Je favoriete vragen bij elkaar!
          </Text>
        </View>
      </View>
      {questions.map((question, index) => (
        <View key={index} style={styles.questionCard}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.avatar}>
                <Avatar
                  size={75}
                  style={styles.avatar}
                  rounded
                  source={{
                    uri: question.profiles.avatar_url
                     ? `${SUPABASE_URL}/storage/v1/object/public/${question.profiles.avatar_url}`
                      : blankProfilePhoto,
                  }}
                />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.username}>
                  {question.anonymous === "true"? "Anonymous" : question.profiles.username}
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
    </View>
  );
};

// Stylesheet for styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
  },
  questionCard: {
    margin: 7,
    borderRadius: 9,
    backgroundColor: "#FDFDFD",
    borderColor: "#707070",
    borderWidth: 0.2,
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

export default AllQuestionLikes;
