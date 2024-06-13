import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { supabase } from "../../../../utils/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const AllPeptalkSubmissions = () => {
  const [peptalks, setPeptalks] = useState([]);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
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

    fetchUser();
  }, []);

  const fetchPeptalks = async () => {
    const { data, error } = await supabase
    .from("quotes")
    .select("quote,user_id,id,profiles ( id, username )")
    .eq("user_id", userId);

    if (error) {
      console.error("Error fetching peptalks:", error);
      return [];
    }

    return data;
  };

  useEffect(() => {
    if (userId) {
      fetchPeptalks().then((fetchedPeptalks) => setPeptalks(fetchedPeptalks));
      supabase
      .channel("quotes")
      .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "quotes" },
          handleInserts
        )
      .subscribe();
    }
  }, [userId]);

  const handleInserts = (payload) => {
    console.log("Change received!", payload);
    fetchPeptalks().then((fetchedPeptalks) => setPeptalks(fetchedPeptalks));
  };

  const colors = ["#EDF6F9"];
  const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  };

  async function deletePeptalk(peptalkId) {
    const { error } = await supabase
    .from("quotes")
    .delete()
    .eq("id", peptalkId);

    if (error) {
      console.error("Error deleting peptalk:", error);
      return;
    }

    fetchPeptalks().then((fetchedPeptalks) => setPeptalks(fetchedPeptalks));
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ingezonden</Text>
        <Text style={styles.description}>
          Bekijk, bewerk of verwijder je ingezonden peptalks!
        </Text>
      </View>
      <View style={styles.peptalks}>
        {peptalks.map((peptalk, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.peptalk, { backgroundColor: getRandomColor() }]}
            onPress={() => console.log(`Tapped on ${peptalk.quote}`)}
          >
      
            <Text style={styles.text}>{peptalk.quote}</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal:10 }}>
            <Text style={styles.username}>{peptalk.profiles.username}</Text>
            {peptalk.user_id === userId && (
              <MaterialCommunityIcons
                name="delete"
                size={22}
                color="red"
                onPress={() => deletePeptalk(peptalk.id)}
              />
            )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    flexDirection: "column",
    justifyContent: "space-between",
marginLeft: 10,
    marginBottom: 20,
  },
  title: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 20,
  },
  description: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 10,
    fontWeight: "400",
  },
  peptalks: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  peptalk: {
    width: 160,
    height: 160,
    margin: 7,
    display: "flex",
    justifyContent: "space-between",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    fontFamily: "AvenirNext-Regular",
    color: "#213658",
    fontSize: 11,
    fontWeight: "400",
    padding: 10,
    marginTop: 10,
  },
  username: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 10,
    fontWeight: "700",
    padding: 10,
  },
});

export default AllPeptalkSubmissions;
