import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import run from "../../../../assets/images/running.jpeg";

import { supabase } from "../../../utils/supabase";
import { SUPABASE_URL } from "@env";

const EventDetail = ({ route }) => {
  const navigation = useNavigation();
  const { event } = route.params;

  const [userId, setUserId] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [attendeesCount, setAttendeesCount] = useState(0);
  const [isEditing, setIsEditing] = useState(true);
  const [eventName, setEventName] = useState(event.name);
  const [eventDescription, setEventDescription] = useState(event.description);
  const [eventDate, setEventDate] = useState(new Date(event.date));
  const [eventStartTime, setEventStartTime] = useState(new Date(`${event.date}T${event.start_time}`));
  const [eventLocation, setEventLocation] = useState(event.location);
  const [showDatePicker, setShowDatePicker] = useState(true);
  const [showTimePicker, setShowTimePicker] = useState(true);
 
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (user) setUserId(user.id);
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

        if (error) throw error;
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

        if (error) throw error;
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

  const reverseDate = (date) => {
    const day = ("0" + date.getDate()).slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatTime = (date) => {
    const hours = ("0" + date.getHours()).slice(-2);
    const minutes = ("0" + date.getMinutes()).slice(-2);
    return `${hours}u${minutes}`;
  };

  const updateQuestion = async () => {
    const { error } = await supabase
      .from("events")
      .update({
        name: eventName,
        description: eventDescription,
        date: eventDate.toISOString().split('T')[0],
        start_time: eventStartTime.toTimeString().split(' ')[0],
        location: eventLocation,
      })
      .eq("id", event.id);

    if (error) {
      console.error("Error updating question:", error);
    } else {
      setIsEditing(false);
      navigation.navigate("Events");
      
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={
              event.photo
                ? { uri: `${SUPABASE_URL}/storage/v1/object/public/${event.photo}` }
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
                <AntDesign name="edit" size={16} color="#213658" />
                <Text style={styles.title}>Update Event</Text>
              </View>
            </View>

            <View style={styles.updateContentContainer}>
              <Text style={styles.descriptionHeading}>Naam van het event</Text>
              <TextInput
                style={styles.titleUpdate}
                value={eventName}
                onChangeText={setEventName}
                multiline
              />

              <Text style={styles.descriptionHeading}>Beschrijving van het event</Text>
              <TextInput
                style={styles.descriptionUpdate}
                value={eventDescription}
                onChangeText={setEventDescription}
                multiline
              />

              <Text style={styles.descriptionHeadingDetails}>Details van het event</Text>
              <View style={styles.detailDescription}>
                <View style={styles.eventDetail}>
                  <Ionicons name="calendar" size={20} color="#213658" style={styles.eventDetailIcon} />
                  {showDatePicker && (
                    <DateTimePicker
                      testID="datePicker"
                      value={eventDate}
                      mode="date"
                      display="default"
                      onChange={(e, selectedDate) => {
                        setShowDatePicker(true);
                        if (selectedDate) {
                          setEventDate(selectedDate);
                        }
                      }}
                    />
                  )}
                </View>
                <View style={styles.eventDetail}>
                  <Ionicons name="time" size={20} color="#213658" style={styles.eventDetailIcon} />
                  {/* <Text style={styles.eventDetailText}>{formatTime(eventStartTime)}</Text>
                  <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                    <Text style={styles.datePickerButtonText}>Wijzig tijd</Text>
                  </TouchableOpacity> */}
                  {showTimePicker && (
                    <DateTimePicker
                      testID="timePicker"
                      value={eventStartTime}
                      mode="time"
                      display="default"
                      onChange={(e, selectedTime) => {
                        setShowTimePicker(true);
                        if (selectedTime) {
                          setEventStartTime(selectedTime);
                        }
                      }}
                    />
                  )}
                </View>
                <View style={styles.eventDetail}>
                  <Ionicons name="location" size={20} color="#213658" style={styles.eventDetailIcon} />
                  <TextInput
                    style={styles.eventDetailText}
                    value={eventLocation}
                    onChangeText={setEventLocation}
                  />
                </View>
              </View>

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
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
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
  updateContentContainer: {
    marginTop: 20,
  },
  detailHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  detailHeadingContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailHeadingJoinBtn: {},
  descriptionHeading: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontWeight: "600",
    marginBottom: 5,
  },
  descriptionHeadingDetails: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontWeight: "600",
    marginBottom: 10,
  },
  extraDetailHeading: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontWeight: "600",
    marginBottom: 0,
  },
  descriptionUpdateDetails: {
    fontFamily: "AvenirNext-Regular",
    color: "#213658",
    fontSize: 11,
    fontWeight: "400",
    marginLeft: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    marginLeft: 10,
  },
  titleUpdate: {
    fontSize: 14,
    fontWeight: "400",
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    marginBottom: 10,
 
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
    marginRight: 10,
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
  descriptionUpdate: {
    fontFamily: "AvenirNext-Regular",
    color: "#213658",
    fontSize: 11,
    fontWeight: "400",
    marginBottom: 20,
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
  UpdateBtn: {
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
  datePickerButtonText: {
    marginLeft: 10,
    color: "#3584fc",
    textDecorationLine: "underline",
  },
});

export default EventDetail;
