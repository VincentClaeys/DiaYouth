import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { supabase } from "../../../utils/supabase";
import { TextInput } from "react-native-gesture-handler";
import { Alert } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";



const PeptalkSectionHomescreen = () => {
  const [userId, setUserId] = useState("");
  const [quote, setQuote] = useState("");

  const navigation = useNavigation();

//  code for navigating to the peptalk wall
  const navigateToPeptalkWall = () => {
    navigation.navigate('PepTalk');
  }

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
      Alert.alert("Bedankt voor jouw peptalk! Net als insuline kunnen we dit goed gebruiken :)!");
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
