import React, { useState } from "react";
import { Alert, StyleSheet, View, Platform } from "react-native";
import { supabase } from "../utils/supabase";
import { Text } from "react-native-elements";
import CustomInput from "../components/Inputfield";
import CustomButton from "../components/Button";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

// Array met categorieën en hun bijbehorende ID's
const categoriesWithIds = [
  { id: 1, name: "Sport" },
  { id: 2, name: "Sociale activiteiten" },
  { id: 3, name: "Educatie" },
  { id: 4, name: "Algemeen" },
];

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const navigation = useNavigation();

  // Navigates to Login screen
  const navigateToLogin = () => {
    navigation.navigate("Login");
  };

  // Picks an image from the library
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImage(uri);
    }
  };

  // Uploads the selected image to Supabase storage
  const uploadImage = () => {
    return new Promise(async (resolve, reject) => {
      try {
        setUploading(true);

        if (!image) {
          resolve(null); // Resolve promise early if no image is selected
          return;
        }

        const response = await fetch(image);
        if (!response.ok) {
          throw new Error("Failed to fetch image from uri");
        }

        const blob = await response.blob();
        const fileExt = image.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

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

        if (error) {
          reject(error); // Reject promise if there was an error
          return;
        }

        resolve(data.fullPath); // Return the full path of the uploaded image
      } catch (error) {
        reject(error); // Reject promise if there was an error
      } finally {
        setUploading(false);
      }
    });
  };

  // Handles category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategoryId(categoryId);
  };

  // Signs up a new user with email and password
  async function signUpWithEmail() {
    setLoading(true);

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        Alert.alert(error.message);
      } else {
        if (session) {
          await updateProfile(session);
        }
      }
    } catch (error) {
      Alert.alert("Er is een fout opgetreden bij het registreren.");
    } finally {
      setLoading(false);
    }
  }

  // Updates user profile with additional information
  async function updateProfile(session) {
    let photoFileName = null;
    if (image) {
      photoFileName = await uploadImage(); // Wait for the image upload to finish
    }

    try {
      setLoading(true);
      if (!session?.user) {
        throw new Error("No user on the session!");
      }

      const updates = {
        id: session.user.id,
        username,
        avatar_url: photoFileName,
        preference_categorie_event: selectedCategoryId,
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

  return (
    <View style={styles.container}>
      {step === 1 && (
        <View style={styles.stepContainer}>
          <Text style={styles.header}>Registreer 1/2</Text>
          <View style={styles.inputContainer}>
            <CustomInput
              label="Email"
              onChangeText={(text) => setEmail(text)}
              value={email}
              placeholder="email@address.com"
              autoCapitalize="none"
            />
            <CustomInput
              label="Password"
              onChangeText={(text) => setPassword(text)}
              value={password}
              secureTextEntry={true}
              placeholder="Wachtwoord"
              autoCapitalize="none"
            />
            <CustomInput
              label="Username"
              onChangeText={(text) => setUsername(text)}
              value={username}
              placeholder="Gebruikersnaam"
              autoCapitalize="none"
            />
            <CustomButton
              textStyle={styles.buttonText}
              buttonStyle={styles.button}
              title="Volgende"
              disabled={loading}
              onPress={() => setStep(2)}
            />
            <CustomButton
              textStyle={styles.buttonTextLink}
              title="Al een account? Login hier!"
              disabled={loading}
              onPress={navigateToLogin}
            />
          </View>
        </View>
      )}
      {step === 2 && (
        <View style={styles.stepContainer}>
          <Text style={styles.header}>Registreer 2/2</Text>
          <View style={styles.uploadPhotoContainer}>
            <Text style={styles.subHeader}>Profielfoto</Text>
            <View style={styles.uploadPhoto}>
              <MaterialIcons
                onPress={pickImage}
                name="add-a-photo"
                size={24}
                color="#213658"
              />
              <Text style={styles.uploadPhotoText}>
                Upload jouw profielfoto
              </Text>
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.subHeader}>Voorkeur voor activiteiten</Text>
            <View style={styles.categoryContainer}>
              {categoriesWithIds.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategoryId === category.id
                      ? styles.selectedCategoryButton
                      : null,
                  ]}
                  onPress={() => handleCategorySelect(category.id)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      selectedCategoryId === category.id
                        ? styles.selectedCategoryButtonText
                        : null,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <CustomButton
              textStyle={styles.buttonText}
              buttonStyle={styles.button}
              title="Registreer"
              disabled={loading}
              onPress={signUpWithEmail}
            />
            <CustomButton
              textStyle={styles.buttonTextLink}
              title="Terug naar het eerste deel van de registratie."
              disabled={loading}
              onPress={() => setStep(1)}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  stepContainer: {
    marginTop: 100,
  },
  header: {
    fontFamily: "AvenirNext-Bold",
    color: "#3584fc",
    fontSize: 28,
    textAlign: "left",
    padding: 20,
  },
  subHeader: {
    fontFamily: "AvenirNext-Bold",
    color: "#1f2939",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
  },
  inputContainer: {
    padding: 20,
  },
  uploadPhotoContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  uploadPhoto: {
    flexDirection: "row",
    alignItems: "center",
  },
  uploadPhotoText: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 15,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#3584fc",
    borderRadius: 8,
    marginBottom: 10,
    marginRight: 10,
    alignItems: "center",
  },
  selectedCategoryButton: {
    backgroundColor: "#3584fc",
  },
  categoryButtonText: {
    color: "#3584fc",
    fontFamily: "AvenirNext-Bold",
    fontSize: 14,
  },
  selectedCategoryButtonText: {
    color: "#fff",
  },
  button: {
    marginTop: 20,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: "#3584fc",
  },
  buttonText: {
    color: "white",
    fontSize: 12,
  },
  buttonTextLink: {
    fontFamily: "AvenirNext-Medium",
    fontSize: 12,
    color: "#1f2939",
    textAlign: "center",
  },
});
