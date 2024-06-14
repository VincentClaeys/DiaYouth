import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { supabase } from "../../../utils/supabase";
import { Alert } from "react-native";
import { AntDesign, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const PeptalkSectionHomescreen = () => {
  const [userId, setUserId] = useState("");
  const [quote, setQuote] = useState("");

  const navigation = useNavigation();

  // Function to navigate to the PepTalk wall
  const navigateToPeptalkWall = () => {
    navigation.navigate('PepTalk');
  }

  // Effect hook to fetch the logged-in user
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

  // Async function to submit the quote or peptalk
  async function submitQuotes(quote) {
    try {
      const { data, error } = await supabase
      .from("quotes")
      .insert([{ quote, user_id: userId }]);
      if (error) throw error;
      Alert.alert("Dank je wel voor je peptalk Net als insuline kunnen we dit echt goed gebruiken :)!");
      console.log("peptalk verzonden succesvol:", data);
      setQuote("");
    } catch (error) {
      console.error("Fout bij het verzenden van het citaat:", error.message);
    }
  }

  return (
    <View style={styles.pepTalkContainer}>
      <View style={styles.pepTalkContentContainer}>
        <View>
          <View style={styles.pepTalkContentTitle}>
            <FontAwesome5 name="hands-helping" size={20} color="#213658" /> 
            <Text style={styles.pepTalkText}>Peptalk</Text> 
          </View> 
          <Text style={styles.pepTalkDescription}>
            Naast suiker geeft ook jouw peptalk energie!
          </Text>
        </View>
        <View style={styles.iconContainer}>
          <AntDesign 
            onPress={navigateToPeptalkWall} 
            name="arrowright" 
            size={24} 
            color="#3584FC" 
          />
        </View>
      </View>

      <View style={styles.pepTalkInputContainer}>
        <TextInput
          placeholder="Stuur jouw peptalk door!"
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
          <FontAwesome
            style={{ marginLeft: -40 }}
            name="send"
            size={20}
            color="#3584fc"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    color: "#213658", // Donkerblauw -- Subkleur (voor tekst)
    fontSize: 11,
    fontWeight: "400",
  },
  pepTalkInputContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  iconContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0.5, height: 0.5 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 5,
  },
  inputPepTalk: {
    width: "85%",
    borderBottomColor: "#213658",
    borderBottomWidth: 0.2,
    padding: 10,
    paddingBottom: 12,
    fontFamily: "AvenirNext-Bold",
    fontSize: 11,
    fontWeight: "400",
  },
  btnNormal: {
    padding: 10,
    paddingBottom: 12,
    borderRadius: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default PeptalkSectionHomescreen;
