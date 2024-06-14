import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import run from "../../../../assets/images/running.jpeg";

import { supabase } from "../../../utils/supabase";
import { SUPABASE_URL } from "@env";

const EventDetail = ({ route }) => {
  const navigation = useNavigation();
  const { event } = route.params;

  const [userId, setUserId] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [attendeesCount, setAttendeesCount] = useState(0);

  // Fetches the current user ID
  useEffect(() => {
    const fetchUsername = async () => {
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
    fetchUsername();
  }, []);

  // Checks if the user is already registered for the event
  useEffect(() => {
    const checkUserRegistration = async () => {
      try {
        const { data, error } = await supabase
          .from("events_joined")
          .select("*")
          .eq("user_id", userId)
          .eq("event_id", event.id);

        if (error) throw error;
        if (data.length > 0) setIsJoined(true);
      } catch (error) {
        console.error("Error checking user registration:", error.message);
      }
    };
    if (userId) checkUserRegistration();
  }, [userId, event.id]);

  // Fetches the total number of attendees for the event
  useEffect(() => {
    const fetchAttendeesCount = async () => {
      try {
        const { data, error } = await supabase
          .from("events_joined")
          .select("user_id")
          .eq("event_id", event.id);

        if (error) throw error;
        setAttendeesCount(data.length);
      } catch (error) {
        console.error("Error fetching attendees count:", error.message);
      }
    };
    fetchAttendeesCount();
  }, [event.id]);

  // Handles joining or leaving the event
  const handleJoinEvent = async () => {
    try {
      if (isJoined) {
        await supabase
          .from("events_joined")
          .delete()
          .eq("user_id", userId)
          .eq("event_id", event.id);
        setIsJoined(false);
      } else {
        await supabase
          .from("events_joined")
          .insert([{ user_id: userId, event_id: event.id }]);
        setIsJoined(true);
      }
    } catch (error) {
      console.error("Error handling event registration:", error.message);
    }
  };

  // Formats the event date
  const reverseDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  // Formats the event start time
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    return `${hours}u${minutes}`;
  };

  return (
    <View style={styles.container}>
      {/* Event image and back button */}
      <View style={styles.headerContainer}>
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="return-down-back" size={24} color="#3584FC" />
        </TouchableOpacity>
      </View>
      {/* Event details */}
      <View style={styles.detailsContainer}>
        <View style={styles.eventsHeadContainer}>
          <View style={styles.eventTitleContainer}>
            <Text style={styles.eventTitle}>{event.name}</Text>
            <Text style={styles.organizerText}>
              Georganiseerd door {event.profiles.username}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.joinButton,
              { backgroundColor: isJoined ? "#FAF8FC" : "#3584FC" },
            ]}
            onPress={handleJoinEvent}
          >
            <Text
              style={[
                styles.joinButtonText,
                { color: isJoined ? "#3584FC" : "#FAF8FC" },
              ]}
            >
              {isJoined ? "Ingeschreven" : "Inschrijven"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Event description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionHeading}>Activiteit beschrijving</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>
        {/* Additional event details */}
        <View style={styles.additionalInfoContainer}>
          <View style={styles.eventDetail}>
            <Ionicons
              name="calendar"
              size={20}
              color="#213658"
              style={styles.eventDetailIcon}
            />
            <Text style={styles.eventDetailText}>
              {reverseDate(event.date)}
            </Text>
          </View>
          <View style={styles.eventDetail}>
            <Ionicons
              name="time"
              size={20}
              color="#213658"
              style={styles.eventDetailIcon}
            />
            <Text style={styles.eventDetailText}>
              {formatTime(event.start_time)}
            </Text>
          </View>
          <View style={styles.eventDetail}>
            <Ionicons
              name="location"
              size={20}
              color="#213658"
              style={styles.eventDetailIcon}
            />
            <Text style={styles.eventDetailText}>{event.location}</Text>
          </View>
          <View style={styles.eventDetail}>
            <Ionicons
              name="people"
              size={20}
              color="#213658"
              style={styles.eventDetailIcon}
            />
            <Text style={styles.eventDetailText}>
              Aantal deelnemers: {attendeesCount}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    position: "relative",
  },
  eventImage: {
    width: "100%",
    height: 300,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 25,
    backgroundColor: "white",
    borderRadius: 50,
    padding: 5,
  },
  detailsContainer: {
    flex: 1,
    padding: 20,
  },
  eventTitleContainer: {
    flexDirection: "column",
  },
  eventsHeadContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
  },
  organizerText: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 10,
    fontWeight: "400",
  },
  joinButton: {
    padding: 10,
    alignSelf: "flex-start",
    borderRadius: 5,
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  joinButtonText: {
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "AvenirNext-Bold",
  },
  descriptionContainer: {
    marginTop: 30,
    marginBottom: 20,
  },
  descriptionHeading: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontWeight: "600",
  },
  description: {
    fontFamily: "AvenirNext-Regular",
    color: "#213658",
    fontSize: 11,
    fontWeight: "400",
    marginTop: 10,
  },
  additionalInfoContainer: {
    marginTop: 30,
    marginBottom: 20,
  },
  eventDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  eventDetailIcon: {
    marginRight: 5,
  },
  eventDetailText: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 10,
    fontWeight: "400",
  },
});

export default EventDetail;
