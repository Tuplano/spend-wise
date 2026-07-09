import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Dimensions } from 'react-native';
import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;

/** Slides the screen in from the left or right on every focus (not just first mount) — tab
 * screens under expo-router/ui's Tabs stay mounted and merely toggle `display`, so a plain
 * `entering` animation would only ever play once. */
export function useSlideInOnFocus(from: 'left' | 'right') {
  const translateX = useSharedValue(0);

  // TEMP DEBUG: disabled to isolate a tab-bar-freeze bug
  // useFocusEffect(
  //   useCallback(() => {
  //     translateX.value = from === 'left' ? -SCREEN_WIDTH : SCREEN_WIDTH;
  //     translateX.value = withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) });
  //   }, [from, translateX])
  // );

  return useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
}
