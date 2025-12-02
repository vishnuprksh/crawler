import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { ArticleCard as ArticleCardType } from '../types';
import { ArticleCard } from './ArticleCard';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;

interface CardStackProps {
  cards: ArticleCardType[];
  onSwipeLeft: (card: ArticleCardType) => void;
  onSwipeRight: (card: ArticleCardType) => void;
  onReadMore: (card: ArticleCardType) => void;
}

export const CardStack: React.FC<CardStackProps> = ({ cards, onSwipeLeft, onSwipeRight, onReadMore }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const contextX = useSharedValue(0);
  const contextY = useSharedValue(0);

  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
  }, [currentIndex]);

  const pan = Gesture.Pan()
    .onStart(() => {
      contextX.value = translateX.value;
      contextY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = contextX.value + event.translationX;
      translateY.value = contextY.value + event.translationY;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? 'right' : 'left';
        translateX.value = withSpring(direction === 'right' ? width * 1.5 : -width * 1.5);
        
        if (direction === 'right') {
          runOnJS(onSwipeRight)(cards[currentIndex]);
        } else {
          runOnJS(onSwipeLeft)(cards[currentIndex]);
        }
        runOnJS(setCurrentIndex)(currentIndex + 1);
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-width / 2, 0, width / 2],
      [-10, 0, 10],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const nextCardStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      Math.abs(translateX.value),
      [0, width],
      [0.9, 1],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [{ scale }],
    };
  });

  if (currentIndex >= cards.length) {
    return (
      <View style={styles.emptyContainer}>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {currentIndex + 1 < cards.length && (
        <Animated.View style={[styles.cardContainer, styles.nextCard, nextCardStyle]}>
          <ArticleCard card={cards[currentIndex + 1]} onReadMore={() => {}} />
        </Animated.View>
      )}

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.cardContainer, cardStyle]}>
          <ArticleCard card={cards[currentIndex]} onReadMore={() => onReadMore(cards[currentIndex])} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    position: 'absolute',
    width: width - 32,
  },
  nextCard: {
    zIndex: -1,
  },
  emptyContainer: {
    flex: 1,
  },
});
