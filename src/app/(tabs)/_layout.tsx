import { router } from 'expo-router';
import { TabList, Tabs, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { BarChart3, Home, Plus, Receipt, Target, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabIcon({
  icon: Icon,
  label,
  isFocused,
  ...props
}: TabTriggerSlotProps & { icon: LucideIcon; label: string }) {
  const color = isFocused ? '#2f6bed' : '#9aa6bd';
  return (
    <Pressable {...props} style={styles.tabItem}>
      <Icon size={23} color={color} strokeWidth={1.9} />
      <Text style={[styles.tabLabel, { color, fontWeight: isFocused ? '700' : '600' }]}>{label}</Text>
    </Pressable>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs>
      <TabSlot />
      <TabList asChild>
        <View style={StyleSheet.flatten([styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }])}>
          <TabTrigger name="index" href="/" asChild>
            <TabIcon icon={Home} label="Home" />
          </TabTrigger>
          <TabTrigger name="activity" href="/activity" asChild>
            <TabIcon icon={Receipt} label="Activity" />
          </TabTrigger>
          <View style={styles.fabSlot}>
            <Pressable style={styles.fab} onPress={() => router.push('/add-transaction')}>
              <Plus size={26} color="#fff" strokeWidth={2.4} />
            </Pressable>
          </View>
          <TabTrigger name="budgets" href="/budgets" asChild>
            <TabIcon icon={Target} label="Budgets" />
          </TabTrigger>
          <TabTrigger name="insights" href="/insights" asChild>
            <TabIcon icon={BarChart3} label="Insights" />
          </TabTrigger>
        </View>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eef1f6',
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 10,
  },
  fabSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#2f6bed',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -16 }],
    shadowColor: '#2f6bed',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
});
