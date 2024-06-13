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
import { AntDesign } from '@expo/vector-icons';

// Supabase utility
import { supabase } from "../../../utils/supabase";

// Assets
import blankProfileImage from "../../../../assets/images/blank_profile.jpg";

// Environment variable
import { SUPABASE_URL } from "@env";

const UpdateQuestion = ({
  visible,
  onClose,
  question,
  isEditing: initialIsEditing,
}) => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [userId, setUserId] = useState("");
  const [isEditing, setIsEditing] = useState(initialIsEditing || false);
  const [questionText, setQuestionText] = useState(question.question_text);

  // Fetch comments and AI answer when modal becomes visible
  useEffect(() => {
    if (visible) {
      fetchComments();
    }
  }, [visible]);


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
      .select("answer_text, user_id, profiles(*)")
      .eq("question_id", question.id);

    if (error) {
      console.error("Error fetching comments:", error);
      return;
    }
    setComments(data);
  };



  // Update question text
  const updateQuestion = async () => {
    const { error } = await supabase
      .from("questions")
      .update({ question_text: questionText })
      .eq("id", question.id);

    if (error) {
      console.error("Error updating question:", error);
    } else {
      setIsEditing(false); // Reset editing mode after successful update
      onClose(); // Close modal
    }
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
                {/* Header section */}
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
                          {
                            backgroundColor: question.question_categories.color,
                          },
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

                {/* Edit question section */}
                <View style={styles.titleContainer}>
                  <AntDesign name="edit" size={16} color="#213658" />
                  <Text style={styles.questionTextTitle}>Verander je vraag.</Text>
                </View>
                {isEditing ? (
                  <TextInput
                    style={styles.questionText}
                    value={questionText}
                    onChangeText={setQuestionText}
                    multiline
                  />
                ) : (
                  <Text style={styles.questionText}>{question.question_text}</Text>
                )}

                {/* Action buttons */}
                <View style={styles.actionsContainer}>
                  {isEditing ? (
                    <TouchableOpacity style={styles.UpdateBtn} onPress={updateQuestion}>
                      <Text style={styles.submitButtonText}>Opslaan</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => setIsEditing(true)}>
                      <Text>Bewerken</Text>
                    </TouchableOpacity>
                  )}
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
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  questionTextTitle: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 11,
    fontWeight: "400",
    marginLeft: 10,
  },
  questionText: {
    fontFamily: "AvenirNext-Regular",
    color: "#213658",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 20,
    marginTop: 10,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  UpdateBtn: {
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
});

export default UpdateQuestion;
