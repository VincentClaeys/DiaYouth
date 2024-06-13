import React, { useState, useEffect } from 'react';
import { Image, View, Text, StyleSheet, ActivityIndicator } from 'react-native'; 
import { supabase } from '../../../utils/supabase';
import { FlatList } from 'react-native-gesture-handler';

const ImageItem = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();  // Fetch images when component mounts
  }, []);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('test')
        .list('', { limit: 100 });

      if (error) {
        console.error('Error fetching images:', error.message);
        return;
      }

      const publicUrls = await Promise.all(
        data.map(async (file) => {
          const { data: publicUrlData, error: urlError } = supabase.storage
            .from('test')
            .getPublicUrl(file.name);

          if (urlError) {
            console.error('Error getting public URL:', urlError.message);
            return null;
          }

          const publicUrl = publicUrlData.publicUrl;
          console.log('Fetched public URL:', publicUrl);
          return publicUrl;
        })
      );

      // Filter out null values in case of errors
      setImages(publicUrls.filter(url => url !== null));
      console.log('Images fetched successfully:', publicUrls);
    } catch (error) {
      console.error('Error fetching images:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <Image source={{ uri: item }} style={styles.image} />
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        contentContainerStyle={styles.imageList}
      />
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
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    margin: 10,
  },
  imageList: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ImageItem;
