import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import { StyleSheet, View, Alert, ScrollView, ImageBackground } from "react-native";
import { Text, ListItem } from "react-native-elements";
import CustomButton from "../../components/Button";
import { useNavigation } from "@react-navigation/native";
import { AntDesign, FontAwesome5, MaterialCommunityIcons, Ionicons, MaterialIcons } from "@expo/vector-icons";
import background from "../../../assets/images/header2.png";

export default function SettingsPage({ session }) {
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  // Navigatie functies
  const navigateToAccount = () => navigation.navigate("Account");
  const navigateToPeptalkLikes = () => navigation.navigate("PeptalkLikes");
  const navigateToEventLikes = () => navigation.navigate("EventLikes");
  const navigateToQuestionLikes = () => navigation.navigate("QuestionLikes");
  const navigateToPeptalkSubmissions = () => navigation.navigate("PeptalkSubmissions");
  const navigateToEventSubmissions = () => navigation.navigate("EventSubmissions");
  const navigateToQuestionSubmission = () => navigation.navigate("QuestionSubmissions");


  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <ImageBackground source={background} style={styles.backgroundImage} />
          <View style={styles.welcomeContentContainer}>
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeText}>Instellingen</Text>
            </View>
            <Ionicons style={styles.iconSettings} name="settings-sharp" size={30} color="white" />
          </View>
        </View>

        <View style={styles.listItemContainer}>
          <View style={styles.listItemWrapper}>
            <ListItem containerStyle={styles.listItem} onPress={navigateToAccount}>
              <AntDesign name="edit" size={24} color="#213658" />
              <ListItem.Content>
                <Text style={styles.listItemTitle}>Profielgegevens</Text>
                <Text style={styles.listItemSubtitle}>Wijzig je gegevens</Text>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          </View>

          <View style={styles.listItemWrapper}>
            <Text style={styles.sectionTitle}>Inzendingen</Text>
            <ListItem containerStyle={styles.listItem} onPress={navigateToPeptalkSubmissions}>
              <FontAwesome5 name="hands-helping" size={24} color="#213658" />
              <ListItem.Content>
                <Text style={styles.listItemTitle}>Peptalks</Text>
                <Text style={styles.listItemSubtitle}>Bekijk jouw ingestuurde peptalks</Text>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          </View>

          <View style={styles.listItemWrapper}>
            <ListItem containerStyle={styles.listItem} onPress={navigateToQuestionSubmission}>
              <MaterialCommunityIcons name="frequently-asked-questions" size={24} color="#213658" />
              <ListItem.Content>
                <Text style={styles.listItemTitle}>Vragen</Text>
                <Text style={styles.listItemSubtitle}>Bekijk jouw ingestuurde vragen</Text>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          </View>

          <View style={styles.listItemWrapper}>
            <ListItem containerStyle={styles.listItem} onPress={navigateToEventSubmissions}>
              <MaterialIcons name="event" size={24} color="#213658" />
              <ListItem.Content>
                <Text style={styles.listItemTitle}>Activiteiten</Text>
                <Text style={styles.listItemSubtitle}>Bekijk jouw ingestuurde evenementen</Text>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          </View>

          <View style={styles.listItemWrapper}>
            <Text style={styles.sectionTitle}>Favorieten</Text>
            <ListItem containerStyle={styles.listItem} onPress={navigateToPeptalkLikes}>
              <FontAwesome5 name="hands-helping" size={24} color="#213658" />
              <ListItem.Content>
                <Text style={styles.listItemTitle}>Peptalks</Text>
                <Text style={styles.listItemSubtitle}>Bekijk jouw gelikete peptalks</Text>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          </View>

          <View style={styles.listItemWrapper}>
            <ListItem containerStyle={styles.listItem} onPress={navigateToQuestionLikes}>
              <MaterialCommunityIcons name="frequently-asked-questions" size={24} color="#213658" />
              <ListItem.Content>
                <Text style={styles.listItemTitle}>Vragen</Text>
                <Text style={styles.listItemSubtitle}>Bekijk jouw gelikete vragen</Text>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          </View>

          <View style={styles.listItemWrapper}>
            <ListItem containerStyle={styles.listItem} onPress={navigateToEventLikes}>
              <MaterialIcons name="event" size={24} color="#213658" />
              <ListItem.Content>
                <Text style={styles.listItemTitle}>Activiteiten</Text>
                <Text style={styles.listItemSubtitle}>Bekijk jouw gelikete evenementen</Text>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          </View>
        </View>

        <CustomButton
          title="Sign Out"
          onPress={() => supabase.auth.signOut()}
          buttonStyle={styles.signOutButton}
          textStyle={styles.signOutButtonText}
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 200,
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImage: {
    height: 800,
    position: "absolute",
    top: -440,
    left: -200,
    right: -80,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  welcomeContentContainer: {
    flexDirection: "row",
    marginTop: 100,
    justifyContent: "space-between",
    width: "90%",
    alignItems: "center",
  },
  welcomeTextContainer: {
    flexDirection: "column",
    marginLeft: 10,
  },
  welcomeText: {
    fontFamily: "AvenirNext-Bold",
    color: "#3584fc",
    fontSize: 30,
  },
  iconSettings: {
    marginRight: 7,
    marginTop: 7,
  },
  listItemContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  listItemWrapper: {
    width: "90%",
    borderBottomWidth: 0.4,
    borderBottomColor: "#0d397d",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#213658",
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 20,
  },
  listItem: {
    width: "100%",
    paddingVertical: 20,
  },
  listItemTitle: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 16,
    fontWeight: "600",
  },
  listItemSubtitle: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 11,
    fontWeight: "400",
  },

  signOutButtonText: {
    color: "red",
    fontSize: 14,
    fontWeight: "bold",
  },
});
