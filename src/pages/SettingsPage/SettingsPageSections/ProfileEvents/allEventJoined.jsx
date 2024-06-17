import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";

import run from "../../../../../assets/images/running.jpeg";
import { EvilIcons, AntDesign, Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { supabase } from "../../../../utils/supabase";
import { useNavigation } from "@react-navigation/native";

import { SUPABASE_URL } from "@env";

const allEventsJoined = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [likedQuestions, setLikedQuestions] = useState([]);
  const [userId, setUserId] = useState("");
  const [filters, setFilters] = useState({ categories: [] });

  const navigation = useNavigation();

  useEffect(() => {
    fetchEvents();
    fetchUsername();
  }, []);

  const fetchUsername = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      if (user) {
        fetchLikedQuestions(user.id);
        setUserId(user.id);
      }
    } catch (error) {
      console.error("Error fetching user:", error.message);
    }
  };

  const fetchLikedQuestions = async (userId) => {
    const { data, error } = await supabase
      .from("events_joined")
      .select("event_id")
      .eq("user_id", userId);
    if (error) {
      console.error("Error fetching liked questions:", error);
      return;
    }
    const likedQuestionIds = data.map((like) => like.event_id);
    setLikedQuestions(likedQuestionIds);
    return Promise.resolve();
  };

  const reverseDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("* , event_categories(*), profiles(*)");
      if (error) throw error;
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error.message);
    }
  };

  const handleInsertsEvents = (payload) => {
    fetchEvents();
  };

  useEffect(() => {
    supabase
      .channel("events")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        handleInsertsEvents
      )
      .subscribe();
  });

  const navigateToEventDetail = (event) => {
    navigation.navigate("EventDetail", { event });
  };


  const toggleLike = async (event) => {
    const { data, error } = await supabase
      .from("events_joined")
      .select("id")
      .eq("user_id", userId)
      .eq("event_id", event.id);
    if (error) {
      console.error("Error fetching likes:", error);
      return;
    }

    let operationSuccessful = false;

    if (data.length > 0) {
      const { error: unlikeError } = await supabase
        .from("events_joined")
        .delete()
        .eq("user_id", userId)
        .eq("event_id", event.id);
      if (!unlikeError) {
        operationSuccessful = true;
      } else {
        console.error("Error unliking question:", unlikeError);
      }
    } else {
      const { error: likeError } = await supabase
        .from("events_joined")
        .insert([{ user_id: userId, event_id: event.id }]);
      if (!likeError) {
        operationSuccessful = true;
      } else {
        console.error("Error liking question:", likeError);
      }
    }

    if (operationSuccessful) {
      fetchLikedQuestions(userId);
    }
  };

  const handleInserts = (payload) => {
    fetchLikedQuestions(userId).then(() => {
      fetchEvents();
    });
  };

  useEffect(() => {
    const channel = supabase
      .channel("events_joined")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events_joined" },
        handleInserts
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const deleteEvent = async (eventId) => {
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);
      if (error) throw error;
      fetchEvents(); // Refresh the events list
    } catch (error) {
      console.error("Error deleting event:", error.message);
    }
  };
  // Voeg deze useEffect toe na de bestaande useEffect hooks
useEffect(() => {
  const filteredEvents = events.filter(event => likedQuestions.includes(event.id));
  setFilteredEvents(filteredEvents);
}, [likedQuestions]); // Luister naar veranderingen in likedQuestions


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <View style={styles.headerTitle}>
            <Text style={styles.headerText}>Ingeschreven</Text>
          </View>
          <Text style={styles.headerDescription}>
          Al je inschrijvingen op een rijtje!
          </Text>
        </View>
  
      </View>

     

      {(hasAppliedFilters? filteredEvents : filteredEvents).map((event) => (
        <TouchableOpacity
          key={event.id}
          style={styles.eventCard}
          onPress={() => navigateToEventDetail(event)}
        >
          <View style={styles.imageContainer}>
            <Image
              source={
                event.photo
                  ? {
                      uri: `${SUPABASE_URL}/storage/v1/object/public/${event.photo}`,
                    }
                  : run
              }
              style={styles.eventImage}
            />
          </View>
          <View style={styles.content}>
            <View style={styles.contentLeft}>
              <View style={styles.contentLeftHeading}>
                <Text style={styles.eventName}>{event.name}</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryName}>
                    {event.event_categories.name}
                  </Text>
                </View>
              </View>
              <View style={styles.moreContent}>
                <View style={styles.dateBlock}>
                  <AntDesign name="calendar" size={14} color="black" />
                  <Text style={styles.eventDate}>
                    {reverseDate(event.date)}
                  </Text>
                </View>
                <View style={styles.locationBlock}>
                  <EvilIcons name="location" size={14} color="black" />
                  <Text style={styles.eventLocation}>{event.location}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.likeIcon}
              onPress={() => toggleLike(event)}
            >
              {likedQuestions.includes(event.id) ? (
                <AntDesign name="heart" size={20} color="#213658" />
              ) : (
                <AntDesign name="hearto" size={20} color="#213658" />
              )}
            </TouchableOpacity>

          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    flex: 1,
  },

  header: {
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  modalContent: {
    width: "100%",
  },
  modalTitle: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 18,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterText: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 12,
    marginTop: 10,
    marginBottom: 10,
    fontWeight: "400",
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
    flex: 2,
  },
  submitButtonText: {
    fontFamily: "AvenirNext-Bold",
    fontSize: 10,
    color: "white",
  },
  clearButton: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    marginLeft: 10,
  },
  clearButtonText: {
    fontFamily: "AvenirNext-Bold",
    fontSize: 10,
    color: "white",
  },
  buttonsContainer: {
    flexDirection: "row",
    padding: 10,
    marginBottom: 20,
    display: "flex",
  },
  moreContent: {
    display: "flex",
    flexDirection: "column",
  },
  eventCard: {
    flexDirection: "row",
    marginBottom: 7,
    marginTop: 7,
    borderRadius: 9,
    backgroundColor: "#FDFDFD",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 1.84,
    elevation: 1,
    padding: 10,
    height: 150,
  },
  contentLeftHeading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
  },
  imageContainer: {
    marginRight: 10,
    borderRadius: 9,
    overflow: "hidden",
  },
  eventImage: {
    width: 125,
    height: 150,
  },
  content: {
    flexDirection: "column",
    justifyContent: "space-between",
    flex: 1,
    padding: 10,
  },
  contentLeft: {
    flexDirection: "column",
    justifyContent: "space-between",
    flex: 1,
  },
  eventName: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 12,
    marginBottom: 7.5,
  },
  eventDate: {
    fontFamily: "AvenirNext-Bold",
    fontSize: 12,
    color: "#1F2939",
    fontWeight: "400",
    marginLeft: 5,
  },
  eventLocation: {
    fontFamily: "AvenirNext-Bold",
    color: "#1F2939",
    fontSize: 12,
    fontWeight: "400",
    marginLeft: 5,
  },
  categoryBadge: {
    paddingVertical: 2.5,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "#5FA8D3",
  },
  categoryName: {
    fontFamily: "AvenirNext-Bold",
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  dateBlock: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  locationBlock: {
    flexDirection: "row",
    alignItems: "center",
  },
  likeIcon: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  actionsIconsContainer: {
    flexDirection: "row",
    position: "absolute",
    right: 10,
    bottom: 10,
    alignItems: "center",
    marginTop: 10,
  },
});

export default allEventsJoined;
