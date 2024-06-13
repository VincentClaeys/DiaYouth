import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../../utils/supabase';
import { Platform } from 'react-native';

const UploadImage = () => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };

    getSession();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log('Image picker result:', result);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImage(uri);
      console.log('Image URI set:', uri);
    }
  };

  const uploadImage = async () => {
    try {
      setUploading(true);
  
      if (!image) {
        console.error('No image selected');
        return;
      }
  
      const response = await fetch(image);
      if (!response.ok) {
        throw new Error('Failed to fetch image from uri');
      }
  
      const blob = await response.blob();
      console.log('Image blob:', blob);
  
      if (!blob) {
        throw new Error('Failed to create blob from image');
      }
  
      const fileExt = image.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;
  
      console.log('Uploading image to path:', filePath);
  
      // Maak een FormData object
      const formData = new FormData();
      formData.append('file', {
        name: fileName,
        type: 'image/jpeg',
        uri: Platform.OS === 'android'? image : image.replace('file://', ''),
      });
  
      // Gebruik formData in plaats van de Blob direct
      const { data, error } = await supabase.storage
       .from('test')
       .upload(filePath, formData, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false,
        });
  
      console.log('Supabase upload response:', data);
  
      if (error) {
        console.error('Supabase upload error:', error);
        throw error;
      }
  
      // Rest van de code...
    } catch (error) {
      console.error('Error uploading image:', error.message);
    } finally {
      setUploading(false);
    }
  };
  

  return (
    <View style={styles.container}>
      {session ? (
        <>
          <TouchableOpacity onPress={pickImage} style={styles.button}>
            <Text style={styles.buttonText}>Pick an image</Text>
          </TouchableOpacity>
          {image && <Image source={{ uri: image }} style={styles.image} />}
          {image && (
            <TouchableOpacity onPress={uploadImage} style={styles.button}>
              {uploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Upload Image</Text>
              )}
            </TouchableOpacity>
          )}
        </>
      ) : (
        <Text style={styles.infoText}>Please log in to upload images.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
  },
});

export default UploadImage;
