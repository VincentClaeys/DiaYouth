import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const CustomButton = ({ title, onPress, buttonStyle, textStyle }) => {
  return (
    <TouchableOpacity style={[styles.button, buttonStyle]} onPress={onPress}>
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
   
    paddingVertical: 12, // Verticale padding
    paddingHorizontal: 24, // Horizontale padding
    borderRadius: 8, // Afronding van de hoeken
    alignItems: 'center', // Centreren van de inhoud horizontaal
    justifyContent: 'center',
   // Centreren van de inhoud verticaal
  },
  text: {
    fontFamily: "AvenirNext-Bold",
    fontSize: 12, // Tekstgrootte
    color:"#1f2939" 
    
  },
});

export default CustomButton;
