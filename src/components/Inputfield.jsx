import React from 'react';
import { TextInput, View, StyleSheet } from 'react-native';

const CustomInput = ({ placeholder, value, onChangeText, inputStyle, containerStyle, leftIcon}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, inputStyle]}
        secureTextEntry={placeholder === "Wachtwoord" ? true : false}
        leftIcon={leftIcon}
      />
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      borderBottomWidth: 0.4,
      borderBottomColor: '#1f2939',
      marginBottom:20, 

      },
  input: {
    fontFamily: "Avenir-Medium", // Breedte van het invoerveld

    height: 40, // Hoogte van het invoerveld
    fontSize: 16, // Tekstgrootte
    paddingLeft: 10, // Ruimte aan de linkerkant van het invoerveld
    color: '#1f2939', // Tekstkleur
  },
});

export default CustomInput;
