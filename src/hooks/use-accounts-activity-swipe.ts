import { router } from 'expo-router';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

// Deferred a tick: navigating immediately from the gesture callback can leave
// react-native-gesture-handler's native touch claim stuck on the screen being left, which then
// swallows touches (e.g. the tab bar) until the app is reloaded. Letting the gesture fully
// finalize first avoids that.
const goToAccounts = () => setTimeout(() => router.push('/accounts'), 0);
const goToActivity = () => setTimeout(() => router.push('/activity'), 0);

/** Swipe right -> Accounts, swipe left -> Activity. Usable from any tab screen. The offset
 * thresholds require a clearly horizontal drag before activating, so vertical scrolling in the
 * screen's own ScrollView/SectionList is unaffected. onEnd runs as a UI-thread worklet, so
 * router.push must be marshalled back to the JS thread via runOnJS. */
export function useAccountsActivitySwipe() {
  return Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-15, 15])
    .onEnd((e) => {
      if (e.translationX > 60) {
        runOnJS(goToAccounts)();
      } else if (e.translationX < -60) {
        runOnJS(goToActivity)();
      }
    });
}
