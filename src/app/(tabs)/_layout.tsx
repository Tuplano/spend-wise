import { router } from "expo-router";
import {
  TabList,
  Tabs,
  TabSlot,
  TabTrigger,
  type TabTriggerSlotProps,
} from "expo-router/ui";
import {
  BarChart3,
  Home,
  Plus,
  Settings,
  Target,
  type LucideIcon,
} from "lucide-react-native";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColors } from "@/hooks/use-theme-colors";

function TabIcon({
  icon: Icon,
  label,
  isFocused,
  ...props
}: TabTriggerSlotProps & { icon: LucideIcon; label: string }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const color = isFocused ? colors.accent : colors.tabInactive;
  return (
    <Pressable {...props} style={styles.tabItem}>
      <Icon size={20} color={color} strokeWidth={1.9} />
      <Text
        style={[
          styles.tabLabel,
          { color, fontWeight: isFocused ? "700" : "600" },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Tabs>
      <TabSlot />
      <View
        style={StyleSheet.flatten([
          styles.bar,
          { paddingBottom: Math.max(insets.bottom, 10) },
        ])}
      >
        <TabTrigger name="index" asChild>
          <TabIcon icon={Home} label="Home" />
        </TabTrigger>
        <TabTrigger name="budgets" asChild>
          <TabIcon icon={Target} label="Budgets" />
        </TabTrigger>
        <View style={styles.fabSlot}>
          <Pressable
            style={styles.fab}
            onPress={() => router.push("/add-transaction")}
          >
            <Plus size={26} color={colors.textOnAccent} strokeWidth={2.4} />
          </Pressable>
        </View>
        <TabTrigger name="insights" asChild>
          <TabIcon icon={BarChart3} label="Insights" />
        </TabTrigger>
        <TabTrigger name="settings" asChild>
          <TabIcon icon={Settings} label="Settings" />
        </TabTrigger>
      </View>
      {/* Accounts and Activity have no visible tab button; they're reached by swiping on Home
          and stay registered here so router.push("/accounts" | "/activity") can still target them. */}
      <TabList style={styles.hiddenList}>
        <TabTrigger name="index" href="/">
          <Text>Home</Text>
        </TabTrigger>
        <TabTrigger name="activity" href="/activity">
          <Text>Activity</Text>
        </TabTrigger>
        <TabTrigger name="budgets" href="/budgets">
          <Text>Budgets</Text>
        </TabTrigger>
        <TabTrigger name="accounts" href="/accounts">
          <Text>Accounts</Text>
        </TabTrigger>
        <TabTrigger name="insights" href="/insights">
          <Text>Insights</Text>
        </TabTrigger>
        <TabTrigger name="settings" href="/settings">
          <Text>Settings</Text>
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

function createStyles(colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    bar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.track,
      paddingTop: 10,
    },
    hiddenList: {
      display: "none",
    },
    tabItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
      paddingHorizontal: 2,
    },
    tabLabel: {
      fontSize: 9,
    },
    fabSlot: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    fab: {
      width: 54,
      height: 54,
      borderRadius: 18,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
      transform: [{ translateY: -16 }],
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.45,
      shadowRadius: 16,
      elevation: 8,
    },
  });
}
