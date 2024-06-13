import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { supabase } from "../../../utils/supabase";
import { TextInput } from "react-native-gesture-handler";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";

const SearchEventSection = () => {
  const [userId, setUserId] = useState("");
  const [quote, setQuote] = useState("");

  const navigation = useNavigation();

  //  code for navigating to the peptalk wall
  const navigateToPeptalkWall = () => {
    navigation.navigate("PepTalk");
  };

  // code for fetching the logged in user
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

  // code for submitting the quote or peptalk
  async function submitQuotes(quote) {
    try {
      const { data, error } = await supabase
        .from("quotes")
        .insert([{ quote, user_id: userId }]);
      if (error) throw error;
      Alert.alert("Bedankt voor jouw peptalk!");
      console.log("Quote submitted successfully:", data);
    } catch (error) {
      console.error("Error submitting quote:", error.message);
    }
  }

  return (
    <View style={styles.pepTalkContainer}>
      <View style={styles.pepTalkInputContainer}>
        <TextInput
          placeholder="Zoek naar een event"
          style={styles.inputPepTalk}
          value={quote}
          onChangeText={(text) => setQuote(text)}
        />
        <TouchableOpacity
          style={[
            styles.btnNormal,
            quote.trim().length === 0 && styles.disabledButton,
          ]}
          onPress={() => quote.trim().length > 0 && submitQuotes(quote)}
          disabled={quote.trim().length === 0}
        >
          <AntDesign
            name="search1"
            style={{ marginLeft: -40 }}
            size={20}
            color="#3584fc"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // styles for the pepTalk container en content

  pepTalkContainer: {
    marginTop: 40,
    display: "flex",
    flexDirection: "column",
    marginLeft: 10,
  },
  pepTalkContentContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pepTalkContentTitle: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  pepTalkText: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 20,
    marginLeft: 10,
  },
  pepTalkDescription: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658", // donkerblauw -- Subkleur (voor tekst)
    fontSize: 11,
    fontWeight: "400",
  },
  pepTalkInputContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  inputPepTalk: {
    width: "85%",
    borderBottomColor: "#213658",
    borderBottomWidth: 0.4,
    padding: 10,
    fontFamily: "AvenirNext-Bold",
    fontSize: 12,
    fontWeight: "400",
  },
  btnNormal: {
    padding: 10,
    borderRadius: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default SearchEventSection;
