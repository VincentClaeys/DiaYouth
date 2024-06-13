import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { MaterialIcons, AntDesign, EvilIcons } from "@expo/vector-icons";
import run from "../../../../assets/images/run.jpg";
import { supabase } from "../../../utils/supabase";
import { useNavigation } from "@react-navigation/native";
import { SUPABASE_URL } from "@env";

const EventSectionHomescreen = () => {
  const [events, setEvents] = useState([]);
  const navigation = useNavigation();
  const [userId, setUserId] = useState("");
  const [likedQuestions, setLikedQuestions] = useState([]);


  const navigateToAlleEvents = () => {
    navigation.navigate("Events");
  };

  const navigateToEventDetail = (event) => {
    navigation.navigate("EventDetail", { event });
  };

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
      if (error) {
        throw error;
      }
      if (user) {
        setUserId(user.id);
        console.log("userId", user.id);
        fetchLikedQuestions(user.id);
      }
    } catch (error) {
      console.error("Error fetching user:", error.message);
    }
  };

  const toggleLike = async (event) => {
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
      // Unlike the question
      const { error: unlikeError } = await supabase
       .from("likes_event")
       .delete()
       .eq("user_id", userId)
       .eq("event_id", event.id);
  
      if (!unlikeError) {
        operationSuccessful = true;
      } else {
        console.error("Error unliking question:", unlikeError);
      }
    } else {
      // Like the question
      const { error: likeError } = await supabase
       .from("likes_event")
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
  

  const fetchLikedQuestions = async (userId) => {
    const { data, error } = await supabase
      .from("likes_event")
      .select("event_id")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching liked questions:", error);
      return;
    }

    const likedQuestionIds = data.map((like) => like.event_id);
    setLikedQuestions(likedQuestionIds);
    console.log("Liked questions fetched successfully:", likedQuestionIds);
  };

  const reverseDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    return `${hours}u${minutes}`;
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("* , event_categories(*), profiles(*)")
        .order("date", { ascending: true })
        .limit(3);
      if (error) {
        throw error;
      }
      setEvents(data);
      console.log("Events fetched successfully:", data);
    } catch (error) {
      console.error("Error fetching events:", error.message);
    }
  };
  const handleInsertsEvents = (payload) => {
    console.log("ts vnan da!", payload);

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
  const handleInserts = (payload) => {
    console.log("ts vnan da!", payload);

    fetchLikedQuestions(userId);

  };
  useEffect(() => {
    supabase
      .channel("likes_event")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "likes_event" },
        handleInserts
      )
      .subscribe();
    }, [userId]);

  return (
    <View style={styles.eventsContainer}>
      <View style={styles.eventsContentContainer}>
        <View>
          <View style={styles.eventsContentTitle}>

          <MaterialIcons style={styles.eventsIcon} name="event" size={20} color="#213658" />
            <Text style={styles.eventsText}>Activiteiten</Text>
          </View>
        </View>
        <Text style={styles.eventsDescription} onPress={navigateToAlleEvents}>
          Bekijk alles
        </Text>
      </View>

      <View style={styles.eventsListContainer}>
        {events.map((event) => (
          <TouchableOpacity
          key={event.id}
          style={styles.eventCard}
          onPress={() => navigateToEventDetail(event)}
        >
          <View style={styles.imageContainer}>
            <Image
              source={
                event.photo
                  ? { uri: `${SUPABASE_URL}/storage/v1/object/public/${event.photo}` }
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
                  <Text style={styles.categoryName}>{event.event_categories.name}</Text>
                </View>
              </View>
              <View style={styles.moreContent}>
                <View style={styles.dateBlock}>
                  <AntDesign name="calendar" size={14} color="black" />
                  <Text style={styles.eventDate}>{reverseDate(event.date)}</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  eventsContainer: {
    marginTop: 40,
    display: "flex",
    flexDirection: "column",
    marginLeft: 10,
  },
  eventsContentContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contentLeftHeading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
    
  },
  eventsContentTitle: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  eventsText: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 20,
    marginLeft: 10,
  },
  eventsDescription: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 11,
    fontWeight: "400",
  },
  eventsListContainer: {
    marginTop: 10,
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
  imageContainer: {
    marginRight: 10,
    borderRadius: 9,
    overflow: "hidden",
  },
  eventImage: {
    width: 125,
    height: 150, // Adjust height to maintain aspect ratio
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
    fontSize: 13,
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
    // position: "absolute",
    // top : 10,
    // left: 5,

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
    bottom: 10,
  },
});

export default EventSectionHomescreen;
