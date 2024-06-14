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

import run from "../../../../assets/images/running.jpeg";
import { EvilIcons, AntDesign, Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { supabase } from "../../../utils/supabase";
import { useNavigation } from "@react-navigation/native";
import AllCategoriesEvents from "./allCategoriesEvents";
import { SUPABASE_URL } from "@env";

const AllEventsSection = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [likedEvents, setLikedEvents] = useState([]);
  const [userId, setUserId] = useState("");
  const [filters, setFilters] = useState({ categories: [] });

  const navigation = useNavigation();
  useEffect(() => {
    fetchEvents();
    fetchUsername();
    const { eventChannel, likesChannel } = setupRealtime();

    return () => {
      cleanupRealtime(eventChannel, likesChannel);
    };
  }, []);


  const fetchUsername = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      if (user) {
        fetchLikedEvents(user.id); // Renamed to reflect event context
        setUserId(user.id);
      }
    } catch (error) {
      console.error("Error fetching user:", error.message);
    }
  };

  const fetchLikedEvents = async (userId) => { // Renamed for clarity
    const { data, error } = await supabase
    .from("likes_event") // Assuming this table now tracks event likes instead of questions
    .select("event_id")
    .eq("user_id", userId);
    if (error) {
      console.error("Error fetching liked events:", error);
      return;
    }
    const likedEventIds = data.map((like) => like.event_id);
    setLikedEvents(likedEventIds); // Updated variable name for consistency
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
      .select("*, event_categories(*), profiles(*)"); // Ensure this query aligns with your database structure
      if (error) throw error;
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error.message);
    }
  };

  const handleApplyFilters = () => { // Renamed for clarity
    let filtered = [...events];
    if (filters.categories.length > 0) {
      filtered = filtered.filter((event) =>
        filters.categories.includes(event.event_categories.name)
      );
    }
    setFilteredEvents(filtered);
    setHasAppliedFilters(true);
  };

  const handleClearFilters = () => { // Renamed for clarity
    setFilters({ categories: [] });
    setHasAppliedFilters(false);
    setFilteredEvents([]);
  };

  const toggleFilterModal = () => { // Renamed for clarity
    setModalVisible(!modalVisible);
  };

  const navigateToEventDetails = (event) => { // Renamed for clarity
    navigation.navigate("EventDetail", { event });
  };
  const navigateToEventUpdate = (event) => { // Renamed for clarity
    navigation.navigate("EventUpdate", { event });
  };

  const toggleEventLike = async (event) => { // Renamed for clarity
    const { data, error } = await supabase
    .from("likes_event")
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
      .from("likes_event")
      .delete()
      .eq("user_id", userId)
      .eq("event_id", event.id);
      if (!unlikeError) {
        operationSuccessful = true;
      } else {
        console.error("Error unliking event:", unlikeError);
      }
    } else {
      const { error: likeError } = await supabase
      .from("likes_event")
      .insert([{ user_id: userId, event_id: event.id }]);
      if (!likeError) {
        operationSuccessful = true;
      } else {
        console.error("Error liking event:", likeError);
      }
    }

    if (operationSuccessful) {
      fetchLikedEvents(userId); // Use the renamed function
    }
  };

  // const handleEventUpdates = (payload) => { // Renamed for clarity
  //   console.log("This function has been changed.");
  //   fetchLikedEvents(userId).then(() => {
  //     fetchEvents();
  //   });
  // };

  // const handleEvent = (payload) => { // Renamed for clarity
  //   console.log("This function has been changed.");
  //     fetchEvents();
   
  // };

  // useEffect(() => {
  //   supabase
  //   .channel('events')
  //   .on(
  //     'postgres_changes',
  //     {
  //       event: '*',
  //       schema: 'public',
  //       table: "events"
  //     },
  //     handleEvent,
  //     (payload) => console.log(payload)
  //   )
  //   .subscribe()
  // });


  // useEffect(() => {
  //   const channel = supabase
  //   .channel("likes_event")
  //   .on(
  //       "postgres_changes",
  //       { event: "*", schema: "public", table: "likes_event" },
  //       handleEventUpdates // Renamed for clarity
  //     )
  //   .subscribe();
  //   return () => {
  //     supabase.removeChannel(channel);
  //   };
  // }, [userId]);

  const channel = supabase
  .channel('schema-db-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: "events"

    },
    (payload) => console.log(payload)
  )
  .subscribe()

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
  const setupRealtime = () => {
    console.log("Setting up real-time subscription...");

    const eventChannel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        (payload) => {
          console.log("Real-time event payload:", payload);
          fetchEvents();
        }
      )
      .subscribe();

    const likesChannel = supabase
      .channel("likes_event")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "likes_event" },
        (payload) => {
          console.log("Real-time likes payload:", payload);
          fetchLikedEvents(userId);
        }
      )
      .subscribe();

    return { eventChannel, likesChannel };
  };
  const cleanupRealtime = () => {
    console.log("Cleaning up real-time subscription...");
    const { eventChannel, likesChannel } = setupRealtime();
    supabase.removeChannel(eventChannel);
    supabase.removeChannel(likesChannel);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <View style={styles.headerTitle}>
            <Text style={styles.headerText}>Ontdek</Text>
          </View>
          <Text style={styles.headerDescription}>
          Omdat zelfs je glucose van gezelligheid houdt!
          </Text>
        </View>
        <View style={styles.iconContainer}>
          <Ionicons
            onPress={toggleFilterModal}
            name="filter-circle"
            size={30}
            color="#3584FC"
          />
        </View>
      </View>

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <TouchableWithoutFeedback onPress={toggleFilterModal}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              style={styles.modalContainer}
              behavior={Platform.OS === "ios"? "padding" : "height"}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Filters</Text>
                  <View style={styles.filterSection}>
                    <Text style={styles.filterText}>Event Category:</Text>
                    <AllCategoriesEvents
                      onSelectCategory={(categories) =>
                        setFilters({...filters, categories })
                      }
                    />
                  </View>
                  <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                      onPress={() => {
                        handleApplyFilters();
                        toggleFilterModal();
                      }}
                      style={styles.submitButton}
                    >
                      <Text style={styles.submitButtonText}>Apply</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        handleClearFilters();
                        toggleFilterModal();
                      }}
                      style={styles.clearButton}
                    >
                      <AntDesign name="delete" size={24} color="red" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {(hasAppliedFilters? filteredEvents : events).map((event) => (
        <TouchableOpacity
          key={event.id}
          style={styles.eventCard}
          onPress={() => navigateToEventDetails(event)}
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
              onPress={() => toggleEventLike(event)} // Renamed for clarity
            >
              {likedEvents.includes(event.id)? (
                <AntDesign name="heart" size={20} color="#213658" />
              ) : (
                <AntDesign name="hearto" size={20} color="#213658" />
              )}
            </TouchableOpacity>

            <View style={styles.actionsIconsContainer}>
              {event.user_id === userId && (
                <TouchableOpacity
                  key={event.id}
                  onPress={() => navigateToEventUpdate(event)}>
                  <MaterialCommunityIcons
                    name="pencil"
                    size={22}
                    color="#213658"
                  />
                </TouchableOpacity>
              )}

              {event.user_id === userId && (
                <TouchableOpacity onPress={() => deleteEvent(event.id)}>
                  <MaterialCommunityIcons name="delete" size={22} color="red" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 60,
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

export default AllEventsSection;
