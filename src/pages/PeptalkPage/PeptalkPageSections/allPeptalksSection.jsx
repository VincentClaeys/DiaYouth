import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { supabase } from "../../../utils/supabase";
import { FontAwesome } from "@expo/vector-icons";
import { Fontisto } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const AllPeptalkSection = () => {
  const [peptalks, setPeptalks] = useState([]);
  const [likedPeptalks, setLikedPeptalks] = useState([]);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    if (userId) {
      fetchLikedPeptalks();
    }
  }, [userId]);
  
  const fetchLikedPeptalks = async () => {
    if (!userId) {
      return; // Stop de functie als userId leeg is
    }
    
    const { data, error } = await supabase
      .from("likes")
      .select("quote_id")
      .eq("user_id", userId);
  
    if (error) {
      console.error("Fout bij het ophalen van geliked peptalks:", error);
      return;
    }
  
    // Convert de quote_ids naar een array van peptalk IDs
    const likedPeptalkIds = data.map((like) => like.quote_id);
    setLikedPeptalks(likedPeptalkIds);
  };
  
  
  // const fetchLikedPeptalks = async () => {
  //   const { data, error } = await supabase
  //     .from("likes")
  //     .select("quote_id")
  //     .eq("user_id", userId);

  //   if (error) {
  //     console.error("Fout bij het ophalen van geliked peptalks:", error);
  //     return;
  //   }

  //   // Convert de quote_ids naar een array van peptalk IDs
  //   const likedPeptalkIds = data.map((like) => like.quote_id);
  //   setLikedPeptalks(likedPeptalkIds);
  // };

  // useEffect(() => {
  //   if (userId) {
  //     fetchLikedPeptalks();
  //   }
  // }, [userId]);
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

  const fetchPeptalks = async () => {
    const { data, error } = await supabase
      .from("quotes")
      .select("quote,user_id,id,profiles ( id, username )");

    if (error) {
      console.error("Error fetching peptalks:", error);
      return [];
    }

    return data;
  };

  const handleInsertsLikes = (payload) => {
    
    fetchLikedPeptalks();
    console.log("Change is verander!", payload);


  };

  const handleInserts = (payload) => {
    console.log("Change received!", payload);
    fetchPeptalks().then((fetchedPeptalks) => setPeptalks(fetchedPeptalks));
  };
  
  useEffect(() => {
    fetchPeptalks().then((fetchedPeptalks) => setPeptalks(fetchedPeptalks));
    supabase
      .channel("quotes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "quotes" },
        handleInserts
      )
      .subscribe();
  }, []);
  useEffect(() => {
    supabase
      .channel("likes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "likes" },
        handleInsertsLikes
      )
      .subscribe();
  }, []);

  const colors = [ "#EDF6F9" ];
  const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  };

  async function like(peptalk) {
    const { data, error } = await supabase
     .from("likes")
     .select("id")
     .eq("user_id", userId)
     .eq("quote_id", peptalk.id);
  
    if (error) {
      console.error("Fout bij het ophalen van likes:", error);
      return;
    }
  
    if (data.length > 0) {
      // Unlike de peptalk
      await supabase
       .from("likes")
       .delete()
       .eq("user_id", userId)
       .eq("quote_id", peptalk.id);
      setLikedPeptalks(likedPeptalks.filter((id) => id !== peptalk.id));
    } else {
      // Like de peptalk
      await supabase
       .from("likes")
       .insert([{ user_id: userId, quote_id: peptalk.id }]);
      setLikedPeptalks([...likedPeptalks, peptalk.id]);
    }
  }

  async function deletePeptalk(peptalkId) {
    const { error } = await supabase
      .from("quotes")
      .delete()
      .eq("id", peptalkId);

    if (error) {
      console.error("Error deleting peptalk:", error);
      return;
    }

    // Fetch updated list of peptalks
    fetchPeptalks().then((fetchedPeptalks) => setPeptalks(fetchedPeptalks));
  }

  return (
    <View style={styles.allPeptalksContainer}>
      <View style={styles.peptalkRow}>
        {peptalks.map((peptalk, index) => (
          <View
            key={index}
            style={[styles.peptalkBlock, { backgroundColor: getRandomColor() }]}
          >
            <Text style={styles.allPeptalksText}>{peptalk.quote}</Text>

            <View style={styles.bottomPeptalkContent}>
              <Text style={styles.allPeptalksUsername}>
                {peptalk.profiles.username}
              </Text>
              <View style={styles.iconContainer}>
                {likedPeptalks.includes(peptalk.id)? (
                  <Fontisto
                    style={styles.likeBtn}
                    name="heart"
                    size={18}
                    color="#213658"
                    onPress={() => like(peptalk)}
                  />
                ) : (
                  <FontAwesome
                    style={styles.likeBtn}
                    name="heart-o"
                    size={18}
                    color="#213658"
                    onPress={() => like(peptalk)}
                  />
                )}
                {peptalk.user_id === userId && (
           
                  <MaterialCommunityIcons   onPress={() => deletePeptalk(peptalk.id)}       style={styles.deleteBtn} name="delete" size={22} color="red" />
                )}
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  allPeptalksContainer: {
    marginTop: 40,
    display: "flex",
    flexDirection: "column",
  },
  peptalkRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  peptalkBlock: {
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

  bottomPeptalkContent: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  allPeptalksText: {
    fontFamily: "AvenirNext-Regular",
    color: "#213658", // donkerblauw -- Subkleur (voor tekst)
    fontSize: 11,
    fontWeight: "400",
    padding: 10,
    marginTop: 10,
  },
  allPeptalksUsername: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658", //
    fontSize: 10,
    fontWeight: "700",
    padding: 10,
  },
  likeBtn: {
    padding: 10,
  },
  deleteBtn: {
paddingRight  : 10,
  },
});

export default AllPeptalkSection;
