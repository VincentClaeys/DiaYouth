import { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase";
import {
  StyleSheet,
  View,
  Alert,
  Platform,
  TouchableOpacity,
  Modal,
  Image,
} from "react-native";
import { Button, Text } from "react-native-elements";
import CustomButton from "../../../components/Button";
import CustomInput from "../../../components/Inputfield";
import { ListItem, Icon, Avatar } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import blankProfilePhoto from "../../../../assets/images/blank_profile.jpg";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { ImageBackground } from "react-native";
import { SUPABASE_URL } from "@env";
import { ScrollView } from "react-native-gesture-handler";


import background from "../../../../assets/images/header2.png";
import * as ImagePicker from "expo-image-picker"; // Make sure to install expo-image-picker

export default function Profile({ session }) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [website, setWebsite] = useState("");
  const [preferenceCategorie, setPreferenceCategorie] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [email, setEmail] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigation = useNavigation();
  const [eventCategories, setEventCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [image, setImage] = useState(null);
  const [userId, setUserId] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (session) getProfile();
    fetchEventCategories();
  }, [session]);

  useEffect(() => {
    const fetchUsername = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setEmail(user.email);
      setUserId(user.id);
    
    };

    fetchUsername();
  }, []);

  const btnGoBack = () => {
    navigation.navigate("Profile");
  };

  const handleInserts = (payload) => {
    console.log("Change received!", payload);
    getProfile();
  };

  const fetchEventCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("event_categories")
        .select("*");
      if (error) {
        throw error;
      }
      setEventCategories(data);
    } catch (error) {
      console.error("Error fetching event categories:", error.message);
    }
  };

  const handleCategorySelection = (category) => {
    setSelectedCategory(category);
  };
  useEffect(() => {
    const subscription = supabase
      .channel("profiles")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        handleInserts
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
        .from("profiles")
        .select(
          `username, website, avatar_url, preference_categorie_event, event_categories(*)`
        )
        .eq("id", session?.user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
        setPreferenceCategorie(data.event_categories.name);
        setSelectedCategory(data.event_categories.id); // Stelt de initiële geselecteerde categorie in
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({ username, website, avatar_url }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session?.user.id,
        username,
        website,
        avatar_url,
        preference_categorie_event: selectedCategory,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  const handleAvatarEdit = () => {
    setIsModalVisible(true);
  };

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log("Image picker result:", result);

    if (!result.cancelled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImage(uri);
      console.log("Image URI set:", uri);
    }
  };

  const handleUploadImage = () => {
    return new Promise(async (resolve, reject) => {
      try {
        setUploading(true);

        if (!image) {
          console.error("No image selected");
          resolve(null); // Resolve promise early if no image is selected
          return;
        }

        const response = await fetch(image);
        if (!response.ok) {
          throw new Error("Failed to fetch image from uri");
        }

        const blob = await response.blob();
        console.log("Image blob:", blob);

        if (!blob) {
          throw new Error("Failed to create blob from image");
        }

        const fileExt = image.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        console.log("Uploading image to path:", filePath);

        const formData = new FormData();
        formData.append("file", {
          name: fileName,
          type: "image/jpeg",
          uri: Platform.OS === "android" ? image : image.replace("file://", ""),
        });

        const { data, error } = await supabase.storage
          .from("profile_photo")
          .upload(filePath, formData, {
            contentType: "image/jpeg",
            cacheControl: "3600",
            upsert: false,
          });

        console.log("Supabase upload response:", data);

        if (error) {
          console.error("Supabase upload error:", error);
          reject(error); // Reject promise if there was an error
          return;
        }

        // Return the photo filename instead of setting the state
        resolve(data.fullPath); // This will be the full path of the uploaded image
      } catch (error) {
        console.error("Error uploading image:", error.message);
        reject(error); // Reject promise if there was an error
      } finally {
        setUploading(false);
        console.log("Image uploaded successfully");
      }
    });
  };

  async function updateProfilePhoto() {
    let photoFileName = null;

    if (image) {
      photoFileName = await handleUploadImage(); // Wait for the image upload to finish
      console.log("Photo uploaded:", photoFileName);
    }

    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session?.user.id, // Make sure to include the user id
        avatar_url: photoFileName, // Set the new avatar URL
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }
// Zorg ervoor dat je Alert importeert

  const handleUpdatePassword = async () => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://example.com/update-password',
      });
  
      // Controleer of er geen fouten zijn opgetreden
      if (error) {
        console.error('Fout bij het versturen van de reset-link:', error.message);
        Alert.alert("Fout", "Er is iets misgegaan bij het versturen van de reset-link. Probeer het opnieuw.");
        return;
      }
  
      // Als alles goed gaat, toon een popup met een succesbericht
      Alert.alert(
        "Succes!",
        "De reset-link is verzonden naar uw e-mail.",
        [
          {
            text: "OK",
            onPress: () => console.log("OK Pressed"),
          },
        ]
      );
    } catch (err) {
      console.error(err);
      Alert.alert("Fout", "Er is een onverwachte fout opgetreden. Probeer het later opnieuw.");
    }
  };
  
  const renderEventCategories = () => {
    return eventCategories.map((category) => (
      <TouchableOpacity
        key={category.id}
        onPress={() => {
          handleCategorySelection(category.name);
          setSelectedCategory(category.id);
        }}
        style={[
          styles.categoryItem,
          {
            backgroundColor:
              selectedCategory === category.id ? "#3584FC" : "white",
          },
        ]}
      >
        <Text
          style={[
            styles.categoryText,
            {
              color: selectedCategory === category.id ? "white" : "#3584FC",
            },
          ]}
        >
          {category.name}
        </Text>
      </TouchableOpacity>
    ));
  };

  return (
    <ScrollView
    style={styles.scrollView}
    contentContainerStyle={styles.contentContainer}
    showsVerticalScrollIndicator={false}
  >
    <View style={styles.container}>
      <View style={styles.header}>
        <ImageBackground
          source={background}
          style={styles.backgroundImage}
        ></ImageBackground>
        <View style={styles.welcomeContentContainer}>
          <View style={styles.welcomeTextContainer}>
            <Ionicons
              style={styles.goBackBtn}
              name="return-down-back"
              size={24}
              color="black"
              onPress={btnGoBack}
            />
            <Text style={styles.welcomeText}>Profiel</Text>
          </View>
        </View>
      </View>

      <View style={styles.accountContainer}>
        <ListItem style={styles.profileContentContainer}>
          <TouchableOpacity onPress={handleAvatarEdit}>
            <View>
              <Avatar
                size={75}
                rounded
                source={
                  avatarUrl
                    ? {
                        uri: `${SUPABASE_URL}/storage/v1/object/public/${avatarUrl}`,
                      }
                    : blankProfilePhoto
                }
              />
              <View style={styles.editIconContainer}>
                <Entypo name="edit" size={16} color="#213658" />
              </View>
            </View>
          </TouchableOpacity>
          <ListItem.Content style={{ color: "white", fontWeight: "bold" }}>
            <ListItem.Title style={styles.ProfileName}>
              {username}
            </ListItem.Title>
            <ListItem.Subtitle style={styles.ProfileEmail}>
              {email}
            </ListItem.Subtitle>
          </ListItem.Content>
          <ListItem.Chevron color="white" />
        </ListItem>
        <View style={styles.inputfieldsContainer}>
          <Text style={styles.inputfieldsText}>
            Wijzig je gegevens <Entypo name="edit" size={12} color="#1f2939" />
          </Text>
          <View>
            <Text style={styles.inputfieldsName}>Email</Text>
            <CustomInput
              label="Email"
              style={styles.accountInputEmail}
              value={session?.user?.email}
              disabled
            />
          </View>
          <View style={styles.accountInput}>
            <Text style={styles.inputfieldsName}>Username</Text>
    
            <CustomInput
              label="Username"
              value={username || ""}
              onChangeText={(text) => setUsername(text)}
            />
          </View>
          <View style={styles.accountInput}>
            <Text style={styles.inputfieldsName}>Wachtwoord reset</Text>
    
            <CustomButton
              title={loading ? "Loading ..." : "Wachtwoord resetlink versturen"}
              onPress={handleUpdatePassword}
              buttonStyle={styles.customButtonSendUpdatePasswordLinkButton}
              textStyle={styles.customButtonSendUpdatePasswordLink}
              disabled={loading}
            />
          </View>

  
          <View style={styles.categoryContainer}>
            <Text style={styles.inputfieldsName}>
              Favoriete activiteiten categorie
            </Text>
            <View style={styles.categoryList}>{renderEventCategories()}</View>
          </View>

          <View>
            <CustomButton
              title={loading ? "Loading ..." : "Update gegevens"}
              onPress={() =>
                updateProfile({ username, website, avatar_url: avatarUrl })
              }
              buttonStyle={styles.customButton}
              textStyle={styles.customButtonText}
              disabled={loading}
            />

        
          </View>
        </View>
      </View>

      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecteer een nieuwe avatar</Text>
            <Button title="Kies een afbeelding" onPress={handleImagePick} />
            {selectedImage && (
              <Avatar size={100} source={{ uri: selectedImage }} rounded />
            )}
            <Button title="Upload" onPress={updateProfilePhoto} />
          </View>
        </TouchableOpacity>
      </Modal>
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
    display: "flex",
    flexDirection: "row",
    marginTop: 100,
    justifyContent: "space-between",
    width: "90%",
    alignContent: "center",
    alignItems: "center",
  },
  welcomeTextContainer: {
    display: "flex",
    flexDirection: "row",
    marginLeft: 10,
    alignItems: "center",
  },
  welcomeText: {
    fontFamily: "AvenirNext-Bold",
    color: "#3584fc",
    fontSize: 30,
  },
  goBackBtn: {
    fontFamily: "AvenirNext-Bold",
    color: "#3584fc",
    marginBottom: 5,
    marginRight: 20,
  },
  accountContainer: {
    marginTop: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginLeft: 20,
  },
  profileContentContainer: {
    marginTop: 30,
  },
  ProfileName: {
    fontFamily: "AvenirNext-Bold",
    color: "#1f2939",
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 5,
  },
  ProfileEmail: {
    fontFamily: "AvenirNext-Bold",
    color: "#1f2939",
    fontSize: 13,
    fontWeight: "200",
    marginBottom: 5,
  },
  inputfieldsContainer: {
    marginTop: 40,
    marginLeft: 10,
    width: "90%",
  },
  inputfieldsName: {
    fontFamily: "AvenirNext-Bold",
    color: "#1f2939",
    fontSize: 11,
    fontWeight: "200",
    marginBottom: 10,
  },
  inputfieldsText: {
    fontFamily: "AvenirNext-Bold",
    color: "#1f2939",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 30,
  },
  accountInputEmail: {
    marginTop: 20,
  },
  accountInput: {
    marginTop: 20,
  },
  customButton: {
    marginTop: 20,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: "#3584fc",
  },

  customButtonText: {
    color: "white",
    fontSize: 12,
  },
  customButtonSendUpdatePasswordLinkButton: {

alignItems:"flex-start"
  },
  customButtonSendUpdatePasswordLink : {
    color: "#3584fc",
    fontSize: 12,
  },
  customButtonTextDelete: {
    color: "red",
    fontSize: 12,
  },

  editIconContainer: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#FAF8FC",
    borderRadius: 15,
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
  },
  categoryContainer: {
    marginTop: 20,
  },
  categoryList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  categoryText: {
    fontFamily: "AvenirNext-Bold",
    fontSize: 12,
    fontWeight: "600",
  },
  categoryItem: {
    padding: 10,
    margin: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#3584fc",
  },
});
