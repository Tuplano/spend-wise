import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Check, Plus, Settings2, Wifi } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
  Defs,
  Line,
  Path,
  Rect,
  Stop,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";

import { CategoryIcon } from "@/components/budget/category-icon";
import {
  ACCOUNT_TYPE_ICONS,
  type AccountTypeIconKey,
} from "@/constants/accounts";
import { matchBankPreset } from "@/constants/bank-presets";
import { useAccounts, type AccountWithType } from "@/hooks/use-accounts";
import { useDisplayMoney } from "@/hooks/use-display-money";
import { useSlideInOnFocus } from "@/hooks/use-slide-in-on-focus";
import { useThemeColors } from "@/hooks/use-theme-colors";

/** Darkens (negative percent) or lightens (positive) a hex color, for a card's gradient stop. */
function shade(hex: string, percent: number) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp((num >> 16) + amt);
  const g = clamp(((num >> 8) & 0x00ff) + amt);
  const b = clamp((num & 0x0000ff) + amt);
  return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`;
}

/** The last 4 digits to show masked on the card, or null if the user never entered an account number
 * — the number row is omitted entirely rather than showing a made-up placeholder. */
function cardDigits(a: { accountNumber: string | null }) {
  const digitsOnly = a.accountNumber?.replace(/\D/g, "") ?? "";
  return digitsOnly ? digitsOnly.slice(-4).padStart(4, "0") : null;
}

/** Physical cash has no card number or chip — only bank/credit-card/e-wallet accounts get that chrome. */
function isCashLike(a: { typeIcon: string; typeName: string }) {
  return (
    ["wallet", "banknote", "coins"].includes(a.typeIcon) ||
    /\bcash\b/i.test(a.typeName)
  );
}

/** A physical EMV chip rendered in gold, matching a real card's chip artwork. */
function EmvChip({ gradientId }: { gradientId: string }) {
  return (
    <Svg width={34} height={26} viewBox="0 0 40 30">
      <Defs>
        <SvgLinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#f6e2ab" />
          <Stop offset="0.5" stopColor="#d9b56a" />
          <Stop offset="1" stopColor="#b8903f" />
        </SvgLinearGradient>
      </Defs>
      <Rect
        x={0.5}
        y={0.5}
        width={39}
        height={29}
        rx={5.5}
        fill={`url(#${gradientId})`}
        stroke="#9c7830"
        strokeWidth={0.5}
      />
      <Rect
        x={7}
        y={7}
        width={26}
        height={16}
        rx={2.5}
        fill="none"
        stroke="#8a6c2a"
        strokeWidth={0.9}
      />
      <Line x1={20} y1={7} x2={20} y2={23} stroke="#8a6c2a" strokeWidth={0.9} />
      <Line x1={7} y1={15} x2={33} y2={15} stroke="#8a6c2a" strokeWidth={0.9} />
      <Line x1={13} y1={7} x2={13} y2={12} stroke="#8a6c2a" strokeWidth={0.9} />
      <Line x1={27} y1={7} x2={27} y2={12} stroke="#8a6c2a" strokeWidth={0.9} />
    </Svg>
  );
}

/** Faint decorative wave lines in the card background, echoing a real card's guilloché print. */
function CardWaves({ tint }: { tint: string }) {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 268 196"
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <Path
        d="M24 -12 C 100 26, 150 -6, 232 38"
        stroke={tint}
        strokeWidth={1}
        opacity={0.5}
        fill="none"
      />
      <Path
        d="M6 20 C 96 58, 148 22, 246 66"
        stroke={tint}
        strokeWidth={1}
        opacity={0.35}
        fill="none"
      />
      <Path
        d="M-10 96 C 76 58, 176 132, 252 84"
        stroke={tint}
        strokeWidth={1}
        opacity={0.28}
        fill="none"
      />
    </Svg>
  );
}

/** Derives every color/flag a card face needs to render from one account. */
function getCardTheme(a: AccountWithType) {
  const bank = matchBankPreset(a.name);
  const gradientColors: [string, string, string] = bank
    ? bank.gradient
    : [shade(a.color, 12), a.color, shade(a.color, -22)];
  const textColor = bank?.textColor ?? "#ffffff";
  const wordmarkColor = bank?.wordmarkColor ?? textColor;
  const isDarkText = textColor.toLowerCase() !== "#ffffff";
  return {
    bank,
    gradientColors,
    textColor,
    wordmarkColor,
    isDarkText,
    strong: isDarkText ? "rgba(26,26,26,0.9)" : "rgba(255,255,255,0.92)",
    soft: isDarkText ? "rgba(26,26,26,0.72)" : "rgba(255,255,255,0.75)",
    iconBadgeBg: isDarkText ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.16)",
    waveTint: isDarkText ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)",
    cashLike: isCashLike(a),
    digits: cardDigits(a),
  };
}

/** The incoming card grows forward out from the stack behind it. */
function cardEnter() {
  "worklet";
  return {
    initialValues: {
      opacity: 0,
      transform: [{ translateY: 22 }, { scale: 0.92 }],
    },
    animations: {
      opacity: withTiming(1, { duration: 220 }),
      transform: [
        { translateY: withTiming(0, { duration: 300 }) },
        { scale: withTiming(1, { duration: 300 }) },
      ],
    },
  };
}

/** The outgoing card recedes back into the stack. */
function cardExit() {
  "worklet";
  return {
    initialValues: { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }] },
    animations: {
      opacity: withTiming(0, { duration: 180 }),
      transform: [
        { translateY: withTiming(16, { duration: 220 }) },
        { scale: withTiming(0.94, { duration: 220 }) },
      ],
    },
  };
}

export default function AccountsScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const accounts = useAccounts();
  const { formatCents } = useDisplayMoney();
  const slideStyle = useSlideInOnFocus("left");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const selectedAccount =
    accounts.find((a) => a.id === selectedId) ?? accounts[0];
  const ghosts = selectedAccount
    ? accounts.filter((a) => a.id !== selectedAccount.id).slice(0, 2)
    : [];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Animated.View style={[styles.flexFill, slideStyle]}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Accounts</Text>
            <Pressable
              style={styles.manageButton}
              onPress={() => router.push("/manage-accounts")}
            >
              <Settings2 size={18} color={colors.text} strokeWidth={2} />
            </Pressable>
          </View>

          <Text style={styles.totalLabel}>Total across accounts</Text>
          <Text style={styles.totalValue}>{formatCents(totalBalance)}</Text>

          {accounts.length === 0 || !selectedAccount ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No accounts yet</Text>
              <Pressable
                style={styles.addButton}
                onPress={() => router.push("/add-account")}
              >
                <Plus size={16} color={colors.accent} strokeWidth={2.2} />
                <Text style={styles.addButtonText}>Add account</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.cardStack}>
                {ghosts.map((g, idx) => {
                  const theme = getCardTheme(g);
                  return (
                    <LinearGradient
                      key={g.id}
                      colors={theme.gradientColors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[
                        styles.ghostCard,
                        {
                          top: (idx + 1) * 14,
                          transform: [{ scale: 1 - (idx + 1) * 0.03 }],
                        },
                      ]}
                    >
                      <View style={styles.ghostDim} />
                    </LinearGradient>
                  );
                })}

                <Animated.View
                  key={selectedAccount.id}
                  entering={cardEnter}
                  exiting={cardExit}
                  style={styles.activeCardWrap}
                >
                  {(() => {
                    const a = selectedAccount;
                    const balance = a.balance;
                    const Icon =
                      ACCOUNT_TYPE_ICONS[a.typeIcon as AccountTypeIconKey];
                    const theme = getCardTheme(a);
                    return (
                      <LinearGradient
                        colors={theme.gradientColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.accountCard}
                      >
                        <LinearGradient
                          pointerEvents="none"
                          colors={[
                            "rgba(255,255,255,0.16)",
                            "rgba(255,255,255,0)",
                          ]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 0.65, y: 0.55 }}
                          style={StyleSheet.absoluteFill}
                        />
                        <CardWaves tint={theme.waveTint} />
                        <Icon
                          size={112}
                          color={theme.strong}
                          strokeWidth={1.2}
                          style={styles.cardWatermark}
                        />

                        <View style={styles.accountCardTopRow}>
                          <View style={styles.topLeftGroup}>
                            <View
                              style={[
                                styles.iconBadge,
                                { backgroundColor: theme.iconBadgeBg },
                              ]}
                            >
                              <Icon
                                size={12}
                                color={theme.strong}
                                strokeWidth={2.4}
                              />
                            </View>
                            <Text
                              style={[
                                styles.accountCardName,
                                { color: theme.textColor },
                              ]}
                              numberOfLines={1}
                            >
                              {a.name}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.accountCardType,
                              { color: theme.soft },
                            ]}
                          >
                            {a.typeName}
                          </Text>
                        </View>

                        {!theme.cashLike && theme.bank?.kind !== "ewallet" && (
                          <View style={styles.chipRow}>
                            <EmvChip gradientId={`chip-${a.id}`} />
                            <Wifi
                              size={17}
                              color={theme.soft}
                              strokeWidth={2.1}
                              style={styles.contactless}
                            />
                          </View>
                        )}

                        {!theme.cashLike && theme.digits && (
                          <Text
                            style={[
                              styles.accountCardNumber,
                              { color: theme.soft },
                            ]}
                          >
                            •••• &nbsp;•••• &nbsp;•••• &nbsp;{theme.digits}
                          </Text>
                        )}

                        <View style={styles.accountCardBottomRow}>
                          <View>
                            <Text
                              style={[
                                styles.bottomLabel,
                                { color: theme.soft },
                              ]}
                            >
                              Balance
                            </Text>
                            <Text
                              style={[
                                styles.accountCardBalance,
                                { color: theme.textColor },
                              ]}
                            >
                              {formatCents(balance)}
                            </Text>
                          </View>
                          {theme.bank && (
                            <Text
                              style={[
                                styles.wordmarkText,
                                { color: theme.wordmarkColor },
                              ]}
                            >
                              {theme.bank.label}
                            </Text>
                          )}
                        </View>
                      </LinearGradient>
                    );
                  })()}
                </Animated.View>
              </View>

              <Text style={styles.sectionLabel}>All accounts</Text>
              <View style={styles.listCard}>
                {accounts.map((a, i) => {
                  const balance = a.balance;
                  const active = a.id === selectedAccount.id;
                  return (
                    <Pressable
                      key={a.id}
                      style={[
                        styles.listRow,
                        i < accounts.length - 1 && styles.listRowBorder,
                      ]}
                      onPress={() => setSelectedId(a.id)}
                    >
                      <CategoryIcon
                        icon={
                          ACCOUNT_TYPE_ICONS[a.typeIcon as AccountTypeIconKey]
                        }
                        color={a.color}
                        bgColor={colors.track}
                        size={36}
                        selected={active}
                      />
                      <View style={styles.listText}>
                        <Text style={styles.listName}>{a.name}</Text>
                        <Text style={styles.listType}>{a.typeName}</Text>
                      </View>
                      <Text
                        style={[
                          styles.listBalance,
                          balance < 0 && styles.listBalanceNegative,
                        ]}
                      >
                        {formatCents(balance)}
                      </Text>
                      {active && (
                        <View
                          style={[
                            styles.activeCheck,
                            { backgroundColor: colors.accent },
                          ]}
                        >
                          <Check
                            size={11}
                            color={colors.textOnAccent}
                            strokeWidth={3}
                          />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
                <Pressable
                  style={styles.addRow}
                  onPress={() => router.push("/add-account")}
                >
                  <Plus size={16} color={colors.accent} strokeWidth={2.2} />
                  <Text style={styles.addRowText}>Add account</Text>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

function createStyles(colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flexFill: {
      flex: 1,
    },
    content: {
      padding: 20,
      paddingBottom: 100,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    title: {
      fontSize: 22,
      fontWeight: "800",
      color: colors.text,
      letterSpacing: -0.2,
    },
    manageButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    totalLabel: {
      fontSize: 12.5,
      color: colors.textSecondary,
      fontWeight: "600",
      marginTop: 12,
    },
    totalValue: {
      fontSize: 30,
      fontWeight: "800",
      color: colors.text,
      letterSpacing: -0.4,
      marginBottom: 20,
    },
    cardStack: {
      height: 222,
      marginBottom: 24,
    },
    ghostCard: {
      position: "absolute",
      left: 0,
      right: 0,
      height: 196,
      borderRadius: 18,
      overflow: "hidden",
    },
    ghostDim: {
      ...StyleSheet.absoluteFill,
      backgroundColor: "rgba(0,0,0,0.22)",
    },
    activeCardWrap: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
    },
    accountCard: {
      width: "100%",
      height: 214,
      borderRadius: 18,
      padding: 18,
      justifyContent: "space-between",
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.22,
      shadowRadius: 22,
      elevation: 4,
    },
    cardWatermark: {
      position: "absolute",
      right: -14,
      bottom: -14,
      opacity: 0.1,
    },
    accountCardTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    topLeftGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      flexShrink: 1,
    },
    iconBadge: {
      width: 22,
      height: 22,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    wordmarkText: {
      fontSize: 12.5,
      fontWeight: "800",
      letterSpacing: 0.2,
      color: "#ffffff",
    },
    chipRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    contactless: {
      transform: [{ rotate: "90deg" }],
    },
    accountCardNumber: {
      fontSize: 15.5,
      fontWeight: "600",
      color: "rgba(255,255,255,0.92)",
      letterSpacing: 1.3,
      fontVariant: ["tabular-nums"],
    },
    accountCardBottomRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
    },
    accountCardName: {
      fontSize: 13,
      fontWeight: "700",
      color: "#ffffff",
      flexShrink: 1,
    },
    accountCardType: {
      fontSize: 9.5,
      fontWeight: "700",
      color: "rgba(255,255,255,0.75)",
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    bottomLabel: {
      fontSize: 9,
      fontWeight: "600",
      color: "rgba(255,255,255,0.7)",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    accountCardBalance: {
      fontSize: 16.5,
      fontWeight: "800",
      color: "#ffffff",
      letterSpacing: -0.2,
      fontVariant: ["tabular-nums"],
    },
    addRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 14,
      borderTopWidth: 1,
      borderTopColor: colors.borderSubtle,
    },
    addRowText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.accent,
    },
    activeCheck: {
      width: 18,
      height: 18,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 8,
    },
    emptyCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 28,
      alignItems: "center",
      gap: 14,
    },
    emptyText: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: "600",
    },
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderWidth: 1.5,
      borderColor: colors.borderMuted,
      borderStyle: "dashed",
      borderRadius: 14,
      paddingVertical: 13,
      paddingHorizontal: 20,
    },
    addButtonText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.accent,
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.textSecondary,
      marginBottom: 10,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    listCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    listRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 13,
    },
    listRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSubtle,
    },
    listText: {
      flex: 1,
    },
    listName: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
    },
    listType: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: "600",
      marginTop: 1,
    },
    listBalance: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.text,
    },
    listBalanceNegative: {
      color: colors.danger,
    },
  });
}
