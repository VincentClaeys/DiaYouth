import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import run from "../../../../assets/images/run.jpg";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign, EvilIcons } from "@expo/vector-icons";
import { supabase } from "../../../utils/supabase";
import { useNavigation } from "@react-navigation/native";
import { SUPABASE_URL } from "@env";
import { FontAwesome } from "@expo/vector-icons";
import { Fontisto } from "@expo/vector-icons";

const PopulairEventsSection = () => {
  const [events, setEvents] = useState([]);
  const [userId, setUserId] = useState("");
  const [likedQuestions, setLikedQuestions] = useState([]);
  const [userPreferenceCategory, setUserPreferenceCategory] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    fetchUsername();
  }, []);

  const reverseDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    return `${hours}u${minutes}`;
  };

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
        fetchUserPreferenceCategory(user.id);
        fetchLikedQuestions(user.id);
      }
    } catch (error) {
      console.error("Error fetching user:", error.message);
    }
  };

  const fetchUserPreferenceCategory = async (userId) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("preference_categorie_event")
        .eq("id", userId)
        .single();

      if (userError) {
        throw userError;
      }

      setUserPreferenceCategory(userData.preference_categorie_event);
      console.log(
        "User preference category fetched successfully:",
        userData.preference_categorie_event
      );
    } catch (error) {
      console.error("Error fetching user preference category:", error.message);
    }
  };

  useEffect(() => {
    if (userPreferenceCategory) {
      fetchEvents();
      console.log("User preference category:", userPreferenceCategory);
    }
  }, [userPreferenceCategory]);

  const fetchEvents = async () => {
    try {
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("* , event_categories(*), profiles (*)")
        .eq("event_categorie", userPreferenceCategory) // Filter events op basis van de gebruikersvoorkeurscategorie
        .order("date", { ascending: false })
        .limit(3);
      if (eventError) {
        throw eventError;
      }
      setEvents(eventData);
      console.log("Events fetched successfully:", eventData);
    } catch (error) {
      console.error("Error fetching events:", error.message);
    }
  };

  const navigateToEventDetail = (event) => {
    navigation.navigate("EventDetail", { event });
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

  const handleInserts = (payload) => {
    console.log("ts vnan da!", payload);

    fetchLikedQuestions(userId);
    fetchEvents(); 
  };
  const handleInsertsEvents = (payload) => {
    console.log("ts vnan da!", payload);

    fetchEvents(); 
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
  

  const EventCard = ({ event, onPress }) => {
    return (
      <TouchableOpacity onPress={onPress} style={styles.eventCard}>
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

        <View style={styles.eventContent}>
          <Text style={styles.eventTitle}>{event.name}</Text>

          <View style={styles.locationBlock}>
            <EvilIcons name="location" size={14} color="black" />
            <Text style={styles.eventLocation}>{event.location}</Text>
          </View>
          <View style={styles.dateBlock}>
            <AntDesign name="calendar" size={12} color="black" />
            <Text style={styles.eventDate}>{reverseDate(event.date)}</Text>
          </View>
        </View>
        <View style={styles.eventCategorieContainer}>
          <Text style={styles.eventCategorie}>
            {event.event_categories.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.eventsSection}>
        <View style={styles.eventContentContainer}>
          <Text style={styles.title}>Speciaal voor jou</Text>
        </View>
        <View style={styles.allCategoriesContainer}>
          <FlatList
            data={events}
            horizontal
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <EventCard
                event={item}
                onPress={() => navigateToEventDetail(item)}
              />
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    height: 250,
  },
  title: {
    fontFamily: "AvenirNext-Bold",
    fontSize: 20,
    marginBottom: 10,
    color: "#213658",
    paddingHorizontal: 10,
  },

  contentInfo: {
    marginTop: 10,
  },
  eventCard: {
    margin: 7,
    borderRadius: 9,
    backgroundColor: "#FDFDFD",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 1.84,
    elevation: 1,
    width: 200,
  },
  imageContainer: {
    height: 120,
    overflow: "hidden",
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  likeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "white",
    borderRadius: 30,
    padding: 5,
  },
  eventContent: {
    padding: 10,
  },
  eventTitle: {
    fontFamily: "AvenirNext-Bold",
    fontSize: 15,
    color: "#213658",
    fontWeight: "700",
    marginBottom: 10,
  },
  dateBlock: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 1,
  },
  eventDate: {
    fontFamily: "AvenirNext-Bold",
    fontSize: 10,
    color: "#213658",
    fontWeight: "400",
    marginLeft: 5,
  },
  locationBlock: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    marginTop: 5,
  },
  eventLocation: {
    fontFamily: "AvenirNext-Bold",
    fontSize: 10,
    color: "#213658",
    fontWeight: "400",
    marginLeft: 5,
  },
  eventCategorieContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#5FA8D3",
    paddingVertical: 2.5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  eventCategorie: {
    fontFamily: "AvenirNext-Bold",
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default PopulairEventsSection;
