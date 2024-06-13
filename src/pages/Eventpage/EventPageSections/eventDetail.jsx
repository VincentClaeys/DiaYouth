import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import run from "../../../../assets/images/running.jpeg";

import { supabase } from "../../../utils/supabase";
import {SUPABASE_URL} from "@env";

const EventDetail = ({ route }) => {
  const navigation = useNavigation();
  const { event } = route.params;

  const [userId, setUserId] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [attendeesCount, setAttendeesCount] = useState(0);

  useEffect(() => {
    const fetchUsername = async () => {
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
        }
      } catch (error) {
        console.error("Error fetching user:", error.message);
      }
    };

    fetchUsername();
  }, []);

  useEffect(() => {
    const checkUserRegistration = async () => {
      try {
        const { data, error } = await supabase
          .from("events_joined")
          .select("*")
          .eq("user_id", userId)
          .eq("event_id", event.id);

        if (error) {
          throw error;
        }

        if (data.length > 0) {
          setIsJoined(true);
          console.log("User is already registered for this event");
        }
      } catch (error) {
        console.error("Error checking user registration:", error.message);
      }
    };

    if (userId) {
      checkUserRegistration();
    }
  }, [userId, event.id]);

  useEffect(() => {
    const fetchAttendeesCount = async () => {
      try {
        const { data, error } = await supabase
          .from("events_joined")
          .select("user_id")
          .eq("event_id", event.id);

        if (error) {
          throw error;
        }

        setAttendeesCount(data.length);
      } catch (error) {
        console.error("Error fetching attendees count:", error.message);
      }
    };

    fetchAttendeesCount();
  }, [event.id]);

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

  const reverseDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    return `${hours}u${minutes}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={
            event.photo
              ? {
                  uri: `${SUPABASE_URL}/storage/v1/object/public/${event.photo}`,
                }
              : run // Default image if photo is not available
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
      <View style={styles.contentContainer}>
        <View style={styles.detailsContainer}>
          <View style={styles.detailHeading}>
            <View style={styles.detailHeadingContent}>
              <Text style={styles.title}>{event.name}</Text>
              <Text style={styles.username}>
                Georganiseerd door {event.profiles.username}
              </Text>
            </View>
            <View style={styles.detailHeadingJoinBtn}>
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
          </View>

          <View style={styles.detailDescription}>
            <Text style={styles.descriptionHeading}>
              Activiteit beschrijving
            </Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          <View style={styles.detailDescription}>
            <Text style={styles.extraDetailHeading}>Extra Informatie</Text>
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
                {" "}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
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
  contentContainer: {
    flex: 1,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  detailHeadingContent: {},
  detailHeadingJoinBtn: {},
  descriptionHeading: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontWeight: "600",
  },
  extraDetailHeading: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontWeight: "600",
    marginBottom: 10,
  },
  detailDescription: {
    marginTop: 30,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
  },
  username: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 10,
    fontWeight: "400",
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
  date: {
    fontSize: 18,
    marginVertical: 10,
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
  },
  location: {
    fontSize: 18,
    marginVertical: 10,
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
  },
  description: {
    fontFamily: "AvenirNext-Regular",
    color: "#213658", // donkerblauw -- Subkleur (voor tekst)
    fontSize: 11,
    fontWeight: "400",
    marginTop: 10,
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
});

export default EventDetail;
