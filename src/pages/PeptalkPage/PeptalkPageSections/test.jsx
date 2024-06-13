// src/components/SwipeCardsComponent.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import SwipeCards from 'react-native-swipe-cards';

const dummyQuotes = [
  { id: 1, text: 'Life is what happens when you’re busy making other plans.' },
  { id: 2, text: 'The only way to do great work is to love what you do.' },
  { id: 3, text: 'In three words I can sum up everything I’ve learned about life: it goes on.' },
  // Voeg meer quotes toe
];

const SwipeCardsComponent = () => {
  const [quotes, setQuotes] = useState(dummyQuotes);
  const [animatePress] = useState(new Animated.Value(1));

  const animateIn = () => {
    Animated.timing(animatePress, {
      toValue: 0.5,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const handleLike = (quoteId) => {
    // Implementeer je like-logica hier
    // Bijvoorbeeld: update het aantal likes in je Supabase-tabel
    // en verwijder de gelikete quote uit de lijst
    setQuotes(quotes.filter((quote) => quote.id !== quoteId));
  };

  const handleDislike = (quoteId) => {
    // Implementeer je dislike-logica hier
    // Bijvoorbeeld: verwijder de gedislikete quote uit de lijst
    setQuotes(quotes.filter((quote) => quote.id !== quoteId));
  };

  return (
    <View style={styles.container}>
      <SwipeCards
        cards={quotes}
        renderCard={(quote) => (
          <Animated.View style={[styles.card, { transform: [{ scale: animatePress }] }]}>
            <Text>{quote.text}</Text>
          </Animated.View>
        )}
        renderNoMoreCards={() => (
          <View style={styles.card}>
            <Text>No more quotes!</Text>
          </View>
        )}
        handleYup={() => handleDislike(quotes[0].id)}
        handleNope={() => handleLike(quotes[0].id)}
      />
      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={() => handleDislike(quotes[0].id)} style={styles.button}>
          <Text>Dislike</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleLike(quotes[0].id)} style={styles.button}>
          <Text>Like</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  button: {
    marginHorizontal: 10,
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
});

export default SwipeCardsComponent;
