import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, View, AppState, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { supabase } from './supabase'; // Zorg ervoor dat je een correcte import pad hebt voor je supabase instantie
import { Text } from 'react-native-elements';
import CustomInput from '../components/Inputfield'; // Zorg ervoor dat je een correcte import pad hebt voor je CustomInput component
import CustomButton from '../components/Button'; // Zorg ervoor dat je een correcte import pad hebt voor je CustomButton component
import { useNavigation } from '@react-navigation/native';

// Function to handle AppState changes for Supabase session refresh
const handleAppStateChange = (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
};

// Auth component
export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  // Effect to manage AppState event listener
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Cleanup event listener on unmount
    return () => {
      subscription.remove();
    };
  }, []);

  // Navigate to Register screen
  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  // Function to handle user sign-in
  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios'? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps='always'
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentLoginContainer}>
          <Text style={styles.LoginContentHeader}>DIAYOUTH</Text>
          <Text style={styles.LoginContentSlogan}>Omdat we samen sterker zijn.</Text>
        </View>

        <View style={styles.inputLoginContainer}>
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
            secureTextEntry
            placeholder="Wachtwoord"
            autoCapitalize="none"
          />
          <CustomButton
            textStyle={styles.customButtonText}
            buttonStyle={styles.customButton}
            title="Login"
            disabled={loading}
            onPress={signInWithEmail}
          />
          <CustomButton
            textStyle={styles.customButtonTextRegister}
            title="Nog geen account? Registreer je hier!"
            disabled={loading}
            onPress={navigateToRegister}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentLoginContainer: {
    padding: 20,
    marginTop: 50,
    height: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  LoginContentHeader: {
    fontFamily: 'AvenirNext-Bold',
    color: '#3584fc',
    fontSize: 28,
    textAlign: 'center',
  },
  LoginContentSlogan: {
    fontFamily: 'AvenirNext-Bold',
    fontSize: 12,
    color: '#1f2939',
    textAlign: 'center',
    fontWeight: '400',
  },
  inputLoginContainer: {
    padding: 20,
    height: '50%',
  },
  customButton: {
    marginTop: 20,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#3584fc',
  },
  customButtonText: {
    color: 'white',
    fontSize: 12,
  },
  customButtonTextRegister: {
    fontFamily: 'AvenirNext-Medium',
    fontSize: 12,
    color: '#1f2939',
    textAlign: 'center',
  },
});
