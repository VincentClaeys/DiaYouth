import React from "react";
import { View, Button, Text, StyleSheet } from "react-native";

const StartScreen = ({ navigation }) => {
  // Voeg navigation toe als prop

  const navigateToLogin = () => {
    navigation.navigate("Login"); // Gebruik navigation om naar Home te navigeren
  };

  return (
    <View style={styles.container}>
      <Text> WELCOME TO DIAYOUTH</Text>
      <Button title="LOGIN" onPress={navigateToLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
  formContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
});

export default StartScreen;
