import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { supabase } from "../../../../utils/supabase";
import {
  Fontisto,
  FontAwesome,
} from "@expo/vector-icons";

// Component voor het tonen van favoriete peptalks
const AllPeptalkLikes = () => {
  const [peptalks, setPeptalks] = useState([]);
  const [likedPeptalks, setLikedPeptalks] = useState([]);
  const [userId, setUserId] = useState("");

  // Fetch de gebruikers-ID wanneer de component geladen wordt
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

  // Haal de favoriete peptalks op wanneer de gebruikers-ID beschikbaar is
  useEffect(() => {
    if (userId) {
      fetchLikedPeptalks();
    }
  }, [userId]);

  // Update de lijst met alle peptalks wanneer de favorieten veranderen
  useEffect(() => {
    if (likedPeptalks.length > 0) {
      fetchPeptalks().then((fetchedPeptalks) => setPeptalks(fetchedPeptalks));
    } else {
      setPeptalks([]);
    }
  }, [likedPeptalks]);

  // Haal de favoriete peptalks op uit de database
  const fetchLikedPeptalks = async () => {
    const { data, error } = await supabase
      .from("likes")
      .select("quote_id")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching liked peptalks:", error);
      return [];
    }

    const likedPeptalkIds = data.map((like) => like.quote_id);
    setLikedPeptalks(likedPeptalkIds);
  };

  // Haal de details van de favoriete peptalks op
  const fetchPeptalks = async () => {
    const { data, error } = await supabase
      .from("quotes")
      .select("quote, id, user_id, profiles ( id, username )")
      .in("id", likedPeptalks);

    if (error) {
      console.error("Error fetching liked peptalks:", error);
      return [];
    }

    return data;
  };

  // Functie om een peptalk te liken of te unlike
  const like = async (peptalk) => {
    const { data, error } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", userId)
      .eq("quote_id", peptalk.id);

    if (error) {
      console.error("Error fetching likes:", error);
      return;
    }

    if (data.length > 0) {
      await supabase
        .from("likes")
        .delete()
        .eq("user_id", userId)
        .eq("quote_id", peptalk.id);
      setLikedPeptalks(likedPeptalks.filter((id) => id !== peptalk.id));
    } else {
      await supabase
        .from("likes")
        .insert([{ user_id: userId, quote_id: peptalk.id }]);
      setLikedPeptalks([...likedPeptalks, peptalk.id]);
    }
  };

  // Functie om een peptalk te verwijderen
  const deletePeptalk = async (peptalkId) => {
    const { error } = await supabase
      .from("quotes")
      .delete()
      .eq("id", peptalkId);

    if (error) {
      console.error("Error deleting peptalk:", error);
      return;
    }

    // Refresh de lijst van gelikte peptalks
    setLikedPeptalks(likedPeptalks.filter((id) => id !== peptalkId));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Favorieten</Text>
          <Text style={styles.description}>
            Je favoriete peptalks bij elkaar!
          </Text>
        </View>
      </View>
      <View style={styles.peptalkList}>
        {peptalks.map((peptalk, index) => (
          <View
            key={index}
            style={[styles.peptalkCard, { backgroundColor: "#FAF8FC" }]}
          >
            <Text style={styles.peptalkText}>{peptalk.quote}</Text>

            <View style={styles.actions}>
              <Text style={styles.peptalkUsername}>
                {peptalk.profiles.username}
              </Text>
              {likedPeptalks.includes(peptalk.id) ? (
                <Fontisto
                  style={styles.actionButton}
                  name="heart"
                  size={18}
                  color="#213658"
                  onPress={() => like(peptalk)}
                />
              ) : (
                <FontAwesome
                  style={styles.actionButton}
                  name="heart-o"
                  size={18}
                  color="#213658"
                  onPress={() => like(peptalk)}
                />
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

// Stijlen voor de AllPeptalkLikes component
const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginLeft: 10,
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
  peptalkList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  peptalkCard: {
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
  peptalkText: {
    fontFamily: "AvenirNext-Regular",
    color: "#213658",
    fontSize: 11,
    fontWeight: "400",
    padding: 10,
    marginTop: 10,
  },
  peptalkUsername: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 10,
    fontWeight: "700",
    padding: 10,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 5,
    paddingRight: 5,
    marginBottom: 10,
  },
  actionButton: {
    padding: 10,
  },
  deleteButton: {
    paddingRight: 10,
  },
});

export default AllPeptalkLikes;
