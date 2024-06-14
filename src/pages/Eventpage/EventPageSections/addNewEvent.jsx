// Import necessary modules and components
import React, { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { TextInput } from "react-native-gesture-handler";
import {
  MaterialCommunityIcons,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import CustomButton from "../../../components/Button";

// Define categories with IDs
const categoriesWithIds = [
  { id: 1, name: "Sport" },
  { id: 2, name: "Social" },
  { id: 3, name: "Education" },
  { id: 4, name: "Algemeen" },
];

const AddNewEventSection = () => {
  // State variables for form inputs and UI states
  const [visible, setVisible] = useState(false);
  const [userId, setUserId] = useState("");
  const [eventName, setEventName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(true);
  const [showTimePicker, setShowTimePicker] = useState(true);
  const [time, setTime] = useState(new Date());

  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [step, setStep] = useState(1);

  // Function to open image library and select an image
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

  // Function to upload the selected image to Supabase storage
  const uploadImage = () => {
    return new Promise(async (resolve, reject) => {
      try {
        setUploading(true);

        if (!image) {
          console.error("No image selected");
          resolve(null);
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
          uri: Platform.OS === "android"? image : image.replace("file://", ""),
        });

        const { data, error } = await supabase.storage
         .from("test")
         .upload(filePath, formData, {
            contentType: "image/jpeg",
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error("Supabase upload error:", error);
          reject(error);
          return;
        }

        resolve(data.fullPath);
      } catch (error) {
        console.error("Error uploading image:", error.message);
        reject(error);
      } finally {
        setUploading(false);
      }
    });
  };

  // Handlers for date and time pickers
  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);
  };

  const onChangeTime = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(Platform.OS === "ios");
    setTime(currentTime);
  };

  // Toggle visibility of the modal
  const toggleDialog = () => setVisible(!visible);

  // Fetch current user details
  const fetchUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (user) setUserId(user.id);
    } catch (error) {
      console.error("Error fetching user:", error.message);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Format time to HH:mm:ss
  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  // Submit event function
  const submitEvent = async () => {
    try {
      const formattedTime = formatTime(time);
      let photoFileName = null;

      if (image) {
        photoFileName = await uploadImage();
      }

      const { data, error } = await supabase.from("events").insert([
        {
          date: date.toISOString().split("T")[0],
          user_id: userId,
          event_categorie: selectedCategoryId,
          description: description,
          start_time: formattedTime,
          name: eventName,
          location: location,
          photo: photoFileName,
        },
      ]);

      if (error) throw error;
      Alert.alert("Your event has been successfully sent!");
      console.log("Event submitted successfully:", data);
      setEventName('');
      setDescription('');
      setLocation('');
      setImage(null); // Assuming this clears the image preview
      setSelectedCategoryId(0); // Reset category selection
      setDate(new Date()); // Reset date and time pickers
      setTime(new Date());
      setVisible(false); // Close the modal

    } catch (error) {
      console.error("Error submitting event:", error.message);
    }
  };

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategoryId(categoryId);
  };

  // Render component
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.headerTitle}>
            <MaterialIcons name="event" size={20} color="#213658" />
            <Text style={styles.headerText}>Een leuk idee?</Text>
          </View>
          <Text style={styles.headerDescription}>
            Twijfel niet en organiseer zelf een activiteit.
          </Text>
        </View>
        <View style={styles.iconContainer}>
          <Ionicons
            onPress={toggleDialog}
            name="add-circle"
            size={30}
            color="#3584FC"
          />
        </View>
      </View>
      {/* Modal */}
      <Modal visible={visible} transparent={true} animationType="slide">
        <TouchableWithoutFeedback onPress={toggleDialog}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              style={styles.modalContainer}
              behavior={Platform.OS === "ios"? "padding" : "height"}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalContent}>
                  {/* Step 1: Event Details */}
                  {step === 1 && (
                    <View>
                      {/* Event Title */}
                      <Text style={styles.modalTitle}>
                        Maak een nieuwe activiteit!
                      </Text>
                      <Text style={styles.modalDescription}>
                        Vul de volgende gegevens in.
                      </Text>
                      {/* Event Name Input */}
                      <Text style={styles.inputLabel}>
                        Naam van de activiteit
                      </Text>
                      <TextInput
                        placeholder="Geef een naam"
                        style={styles.input}
                        value={eventName}
                        onChangeText={setEventName}
                      />
                      {/* Description Input */}
                      <Text style={styles.inputLabel}>
                        Omschrijving van de activiteit
                      </Text>
                      <TextInput
                        placeholder="Geef een omschrijving"
                        style={styles.input}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                      />
                      {/* Location Input */}
                      <Text style={styles.inputLabel}>Locatie</Text>
                      <TextInput
                        placeholder="Geef een locatie"
                        style={styles.input}
                        value={location}
                        onChangeText={setLocation}
                      />
                      {/* Date and Time Picker */}
                      <View style={styles.dateTimePickerContainer}>
                        {showDatePicker && (
                          <DateTimePicker
                            style={styles.dateTimePicker}
                            testID="datePicker"
                            value={date}
                            mode="date"
                            display="default"
                            onChange={onChangeDate}
                          />
                        )}
                        {showTimePicker && (
                          <DateTimePicker
                            style={styles.dateTimePicker}
                            testID="timePicker"
                            value={time}
                            mode="time"
                            display="default"
                            onChange={onChangeTime}
                          />
                        )}
                      </View>
                      {/* Next Button */}
                      <CustomButton
                        textStyle={styles.customButtonText}
                        buttonStyle={styles.customButton}
                        title="Volgende"
                        onPress={() => setStep(2)}
                      />
                    </View>
                  )}
                  {/* Step 2: Category and Photo Selection */}
                  {step === 2 && (
                    <View>
                      {/* Category Selection */}
                      <Text style={styles.modalTitle}>
                        Kies een categorie en foto
                      </Text>
                      <Text style={styles.modalDescription}>
                        Selecteer een categorie voor je activiteit.
                      </Text>
                      <View style={styles.categoryContainer}>
                        {categoriesWithIds.map((category) => (
                          <TouchableOpacity
                            key={category.id}
                            style={[
                              styles.categoryButton,
                              selectedCategoryId === category.id &&
                                styles.selectedCategoryButton,
                            ]}
                            onPress={() => handleCategorySelect(category.id)}
                          >
                            <Text
                              style={[
                                styles.categoryButtonText,
                                selectedCategoryId === category.id &&
                                  styles.selectedCategoryText,
                              ]}
                            >
                              {category.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      {/* Photo Upload */}
                      <View style={styles.uploadPhotoContainer}>
                        <MaterialIcons
                          onPress={pickImage}
                          name="add-a-photo"
                          size={24}
                          color="#213658"
                        />
                        <Text style={styles.inputLabelAddPhoto}>
                          Upload een passende foto
                        </Text>
                      </View>
                      {/* Display Selected Photo */}
                      {image && (
                        <Image source={{ uri: image }} style={styles.image} />
                      )}
                      {/* Submit Button */}
                      <TouchableOpacity
                        style={[
                          styles.submitButton,
                          eventName.trim().length === 0 &&
                            styles.disabledButton,
                        ]}
                        onPress={() =>
                          eventName.trim().length > 0 && submitEvent()
                        }
                        disabled={eventName.trim().length === 0}
                      >
                        <Text style={styles.submitButtonText}>Verstuur</Text>
                      </TouchableOpacity>
                      {/* Back Button */}
                      <CustomButton
                        textStyle={styles.customButtonTextGoBack}
                        title="Terug naar vorige stap"
                        onPress={() => setStep(1)}
                      />
                    </View>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    marginLeft: 10,
  },
  iconContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0.5, height: 0.5 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  headerText: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 20,
    marginLeft: 10,
  },
  headerDescription: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 10,
    fontWeight: "400",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "90%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  modalContent: {
    padding: 10,
  },
  modalTitle: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 15,
    fontWeight: "700",
  },
  modalDescription: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 10,
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  categoryButton: {
    backgroundColor: "#FAF8FC",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedCategoryButton: {
    backgroundColor: "#213658",
  },
  categoryButtonText: {
    fontFamily: "AvenirNext-Bold",
    fontSize: 12,
    color: "#213658",
  },
  selectedCategoryText: {
    color: "#FAF8FC",
  },
  inputLabel: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 20,
  },
  inputLabelAddPhoto: {
    fontFamily: "AvenirNext-Bold",
    color: "#213658",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 15,
  },
  input: {
    width: "100%",
    borderBottomColor: "#0D397D",
    borderBottomWidth: 0.4,
    padding: 10,
    fontFamily: "AvenirNext-Bold",
    fontSize: 11,
    fontWeight: "400",
  },
  dateTimePickerContainer: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 20,
  },

  submitButton: {
    marginTop: 20,
    backgroundColor: "#3584fc",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  submitButtonText: {
    fontFamily: "AvenirNext-Bold",
    fontSize: 10,
    color: "white",
  },
  disabledButton: {
    opacity: 0.5,
  },

  customButton: {
    backgroundColor: "#3584fc",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  customButtonText: {
    fontFamily: "AvenirNext-Bold",
    fontSize: 10,
    color: "white",
  },
  customButtonTextGoBack: {
    color: "#3584fc",
    fontSize: 10,
    fontWeight: "400",
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 20,
  },

  categoryContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    flexWrap: "wrap",
    marginTop: 20,
  },
  categoryButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginVertical: 5,
    borderRadius: 5,
    marginRight: 10,
  },
  selectedCategoryButton: {
    backgroundColor: "#007bff",
  },
  categoryButtonText: {
    fontFamily: "AvenirNext-Bold",
    fontSize: 12,
    fontWeight: "400",
  },
  selectedCategoryText: {
    color: "#fff",
  },
  uploadPhotoContainer: {
    marginTop: 20,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
});

export default AddNewEventSection;
