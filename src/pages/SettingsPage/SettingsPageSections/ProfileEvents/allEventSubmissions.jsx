import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { EvilIcons, AntDesign } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { supabase } from "../../../../utils/supabase";
import { useNavigation } from "@react-navigation/native";
import { SUPABASE_URL } from "@env";
import run from "../../../../../assets/images/running.jpeg";

const AllEventSubmissions = () => {
  const [events, setEvents] = useState([]);
  const [userId, setUserId] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (user) setUserId(user.id);
      } catch (error) {
        console.error("Error fetching user:", error.message);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (userId) fetchEvents();
  }, [userId]);

  const reverseDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
       .from("events")
       .select("*, event_categories(*), profiles(*)")
       .eq("user_id", userId);
      if (error) throw error;
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error.message);
    }
  };

  const handleInsertsEvents = () => fetchEvents();

  useEffect(() => {
    if (userId) {
      const channel = supabase.channel("events").on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        handleInsertsEvents
      ).subscribe();
      return () => supabase.removeChannel(channel);
    }
  }, [userId]);

  const navigateToEventDetail = (event) => navigation.navigate("EventDetail", { event });
  const navigateToEventUpdate = (event) => navigation.navigate("EventUpdate", { event });
  const deleteEvent = async (eventId) => {
    try {
      const { error } = await supabase.from("events").delete().eq("id", eventId);
      if (error) throw error;
      fetchEvents(); // Refresh the events list
    } catch (error) {
      console.error("Error deleting event:", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <View style={styles.headerTitle}><Text style={styles.headerText}>Ingezonden</Text></View>
          <Text style={styles.headerDescription}>Bekijk, bewerk of verwijder je ingezonden evenementen</Text>
        </View>
      </View>

      {events.map((event) => (
        <TouchableOpacity key={event.id} style={styles.eventCard} onPress={() => navigateToEventDetail(event)}>
          <View style={styles.imageContainer}>
            <Image source={event.photo? { uri: `${SUPABASE_URL}/storage/v1/object/public/${event.photo}` } : run} style={styles.eventImage} />
          </View>
          <View style={styles.content}>
            <View style={styles.contentLeft}>
              <View style={styles.contentLeftHeading}>
                <Text style={styles.eventName}>{event.name}</Text>
                <View style={styles.categoryBadge}><Text style={styles.categoryName}>{event.event_categories.name}</Text></View>
              </View>
              <View style={styles.moreContent}>
                <View style={styles.dateBlock}><AntDesign name="calendar" size={14} color="black" /><Text style={styles.eventDate}>{reverseDate(event.date)}</Text></View>
                <View style={styles.locationBlock}><EvilIcons name="location" size={14} color="black" /><Text style={styles.eventLocation}>{event.location}</Text></View>
              </View>
            </View>

            <View style={styles.actionsIconsContainer}>
              {event.user_id === userId && <TouchableOpacity onPress={() => navigateToEventUpdate(event)}><MaterialCommunityIcons name="pencil" size={22} color="#213658" /></TouchableOpacity>}
              {event.user_id === userId && <TouchableOpacity onPress={() => deleteEvent(event.id)}><MaterialCommunityIcons name="delete" size={22} color="red" /></TouchableOpacity>}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 40, flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginLeft: 10, marginBottom: 20 },
  headerTitle: { marginBottom: 5 },
  headerText: { fontFamily: "AvenirNext-Bold", color: "#213658", fontSize: 20 },
  headerDescription: { fontFamily: "AvenirNext-Bold", color: "#213658", fontSize: 10, fontWeight: "400" },
  eventCard: { flexDirection: "row", marginBottom: 7, marginTop: 7, borderRadius: 9, backgroundColor: "#FDFDFD", shadowColor: "#000", shadowOffset: { width: 1, height: 1 }, shadowOpacity: 0.25, shadowRadius: 1.84, elevation: 1, padding: 10, height: 150 },
  contentLeftHeading: { display: "flex", flexDirection: "column", alignItems: "left" },
  moreContent: { marginTop: 30, display: "flex", flexDirection: "column", alignItems: "left"},
  imageContainer: { marginRight: 10, borderRadius: 9, overflow: "hidden" },
  eventImage: { width: 125, height: 150 },
  content: { flexDirection: "column", justifyContent: "space-between", flex: 1, padding: 10 },
  eventName: { fontFamily: "AvenirNext-Bold", color: "#213658", fontSize: 12, marginBottom: 7.5 },
  eventDate: { fontFamily: "AvenirNext-Bold", fontSize: 12, color: "#1F2939", fontWeight: "400", marginLeft: 5 },
  eventLocation: { fontFamily: "AvenirNext-Bold", color: "#1F2939", fontSize: 12, fontWeight: "400", marginLeft: 5 },
  categoryBadge: { paddingVertical: 2.5, paddingHorizontal: 10, borderRadius: 20, backgroundColor: "#5FA8D3" },
  categoryName: { fontFamily: "AvenirNext-Bold", fontSize: 10, color: "#FFFFFF", fontWeight: "600" },
  dateBlock: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  locationBlock: { flexDirection: "row", alignItems: "center" },
  actionsIconsContainer: { flexDirection: "row", position: "absolute", right: 10, bottom: 10, alignItems: "center", marginTop: 10 },
});

export default AllEventSubmissions;
