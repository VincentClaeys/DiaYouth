import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { supabase } from "../../../utils/supabase";
import { TextInput } from "react-native-gesture-handler";
import { Alert } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from 'axios';

const AddPeptalkSection = () => {
  const [userId, setUserId] = useState("");
  const [quote, setQuote] = useState("");

  const navigation = useNavigation();

  // Function to navigate to the peptalk wall
  const navigateToPeptalkWall = () => {
    navigation.navigate("PepTalk");
  };

  // Effect hook to fetch the logged-in user
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

  // Function to submit the quote or peptalk
  async function submitQuotes(quote) {
    try {
      const chatGptOptions = {
        method: 'POST',
        url: 'https://openai-api-gpt-3-5-turbo.p.rapidapi.com/api/v1/chat/completions',
        headers: {
          'x-rapidapi-key': 'c6a1eda06amshca85d6b81571302p130628jsne64d037aeb6e',
          'x-rapidapi-host': 'openai-api-gpt-3-5-turbo.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        data: {
          model: 'gemma-7b',
          messages: [
            {
              role: 'assistant',
              content: 'Evalueer de peptalk of tekst die ik instuur, Als de tekst haatzaaiend, beledigend, of ongepast is, antwoord dan "nee". Als de tekst een positieve en aanmoedigende boodschap bevat, antwoord dan "ja". Enkel en alleen antwoord met ja of nee? Niet meer, niet minder.'
            },
            {
              role: 'user',
              content: quote
            }
          ],
          temperature: 0.5,
          top_p: 0.95,
          max_tokens: -1,
          use_cache: false,
          stream: false
        }
      };
      const chatGptResponse = await axios.request(chatGptOptions);
      const chatGptMessage = chatGptResponse.data.choices[0].message.content;
      console.log("ChatGPT response:", chatGptMessage);

      if (chatGptMessage.toLowerCase() === "nee") {
        Alert.alert("Opgepast!! we tolereren geen haatzaaiende, beledigende of ongepaste peptalks");
        return; // Stop hier om de upload te voorkomen
      }

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
    color: "#213658",
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

export default AddPeptalkSection;
