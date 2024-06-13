import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Image,
} from "react-native";
import { supabase } from "../../../utils/supabase";
import { FontAwesome } from "@expo/vector-icons";
import blankProfileImage from "../../../../assets/images/blank_profile.jpg";
import diaYouthLogo from "../../../../assets/images/LogoDiaYouth.png";
import { SUPABASE_URL } from "@env";

const QuestionModal = ({ visible, onClose, question, isEditing: initialIsEditing }) => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [userId, setUserId] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");


  // Fetch comments and AI answer when modal becomes visible
  useEffect(() => {
    if (visible) {
      fetchComments();
      fetchAiAnswer();
    }
  }, [visible]);

  // Log AI answer when it updates
  useEffect(() => {
    console.log("AI answer:", aiAnswer);
  }, [aiAnswer]);

  // Fetch current user ID on component mount
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (user) setUserId(user.id);
      } catch (error) {
        console.error("Error fetching user:", error.message);
      }
    };
    fetchUserId();
  }, []);

  // Fetch comments from the database
  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("question_answers")
      .select("answer_text, user_id, profiles ( * )")
      .eq("question_id", question.id);

    if (error) {
      console.error("Error fetching comments:", error);
      return;
    }
    setComments(data);
  };

  // Fetch AI answer from the database
  const fetchAiAnswer = async () => {
    const { data, error } = await supabase
      .from("questions")
      .select("ai_answer")
      .eq("id", question.id);

    if (error) {
      console.error("Error fetching AI answer:", error);
      return;
    }

    if (data && data.length > 0) {
      setAiAnswer(data[0].ai_answer);
    } else {
      console.log("No AI answer found for the given question ID");
    }
  };

  // Handle submitting a new comment
  const handleCommentSubmit = async () => {
    const { error } = await supabase
      .from("question_answers")
      .insert([
        { question_id: question.id, answer_text: comment, user_id: userId },
      ]);

    if (error) {
      console.error("Error submitting comment:", error);
      return;
    }
    fetchComments();
    setComment("");
  };



  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            style={styles.modalContainer}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.content}>
                <View style={styles.header}>
                  <View style={styles.headerLeft}>
                    <View style={styles.avatar}>
                      <Image
                        source={
                          question.profiles.avatar_url
                            ? {
                                uri: `${SUPABASE_URL}/storage/v1/object/public/${question.profiles.avatar_url}`,
                              }
                            : blankProfileImage
                        }
                        style={styles.avatarImage}
                      />
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.username}>
                        {question.anonymous === "true"
                          ? "Anoniem"
                          : question.profiles.username}
                      </Text>
                      <View
                        style={[
                          styles.categoryBadge,
                          { backgroundColor: question.question_categories.color },
                        ]}
                      >
                        <Text style={styles.categoryName}>
                          {question.question_categories.name}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.date}>10/12/2021</Text>
                </View>
                <Text style={styles.questionText}>{question.question_text}</Text>
                <View style={styles.reactionsContainer}>
                  <Text style={styles.reactionsTitle}>Reacties :</Text>
                  <View style={styles.commentContainerAi}>
                    <View style={styles.commentAvatarSection}>
                      <View style={styles.commentAvatarAi}>
                        <Image source={diaYouthLogo} style={styles.commentImageAi} />
                      </View>
                    </View>
                    <View style={styles.commentContentSection}>
                      <Text style={styles.commentUsernameAi}>@DiaYouth</Text>
                      <Text style={styles.commentTextAi}>{aiAnswer}</Text>
                    </View>
                  </View>

                  {comments.map((comment, index) => (
                    <View key={index} style={styles.commentContainer}>
                      <View style={styles.commentAvatarSection}>
                        <View style={styles.commentAvatar}>
                          <Image
                            source={
                              comment.profiles.avatar_url
                                ? {
                                    uri: `${SUPABASE_URL}/storage/v1/object/public/${comment.profiles.avatar_url}`,
                                  }
                                : blankProfileImage
                            }
                            style={styles.avatarImage}
                          />
                        </View>
                      </View>
                      <View style={styles.commentContentSection}>
                        <Text style={styles.commentUsername}>
                          @{comment.profiles.username}
                        </Text>
                        <Text style={styles.commentText}>{comment.answer_text}</Text>
                      </View>
                    </View>
                  ))}
                  <View style={styles.inputContainer}>
                    <TextInput
                      placeholder="Antwoord hier..."
                      style={styles.input}
                      value={comment}
                      onChangeText={setComment}
                    />
                    <TouchableOpacity
                      style={[
                        styles.sendButton,
                        comment.trim().length === 0 && styles.disabledButton,
                      ]}
                      onPress={() =>
                        comment.trim().length > 0 && handleCommentSubmit()
                      }
                      disabled={comment.trim().length === 0}
                    >
                      <FontAwesome name="send" size={20} color="#3584fc" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
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
  content: {
    margin: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
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
    marginRight: 10,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ccc",
    marginRight: 10,
  },
  commentAvatarAi: {
    width: 40,
    height: 40,
    borderRadius: 15,
    marginLeft: -10,
    marginRight: 10,
  },
  commentImageAi: {
    width: "100%",
    height: "100%",
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
    borderRadius: 20,
    paddingVertical: 2.5,
    paddingHorizontal: 10,
    marginTop: 2,
  },
  categoryName: {
    fontFamily: "AvenirNext-Bold",
    color: "white",
    fontSize: 10,
    fontWeight: "400",
  },
  date: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 8,
    fontWeight: "400",
  },
  questionText: {
    fontFamily: "AvenirNext-Regular",
    color: "#213658",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 20,
    marginTop: 20,
  },
  reactionsContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  reactionsTitle: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 10,
  },
  commentContainer: {
    paddingLeft: 10,
    width: "80%",
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  commentContainerAi: {
    paddingLeft: 10,
    width: "80%",
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  commentUsername: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 11,
    fontWeight: "700",
  },
  commentUsernameAi: {
    fontFamily: "AvenirNext-Bold",
    color: "#3584FC",
    fontSize: 11,
    fontWeight: "700",
  },
  commentText: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 10,
    fontWeight: "400",
    marginTop: 2,
  },
  commentTextAi: {
    fontFamily: "AvenirNext-Bold",
    color: "#3584FC",
    fontSize: 10,
    fontWeight: "400",
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  input: {
    flex: 1,
    borderBottomColor: "#213658",
    borderBottomWidth: 0.4,
    padding: 10,
    fontFamily: "AvenirNext-Bold",
    fontSize: 10,
    fontWeight: "400",
  },
  sendButton: {
    padding: 10,
    borderRadius: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default QuestionModal;
