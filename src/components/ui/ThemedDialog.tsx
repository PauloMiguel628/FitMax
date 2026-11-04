import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDialogStore, DialogButton } from '@/store/dialogStore';

export function ThemedDialog() {
  const { colors, isDark, spacing, radius, typography } = useAppTheme();
  const visible = useDialogStore((state) => state.visible);
  const title = useDialogStore((state) => state.title);
  const message = useDialogStore((state) => state.message);
  const buttons = useDialogStore((state) => state.buttons);
  const variant = useDialogStore((state) => state.variant);
  const customIcon = useDialogStore((state) => state.icon);
  const closeDialog = useDialogStore((state) => state.closeDialog);

  if (!visible) return null;

  const isDestructive = variant === 'destructive';
  const isWarning = variant === 'warning';

  const accentColor = isDestructive
    ? colors.error
    : isWarning
    ? colors.warning
    : colors.primary;

  const badgeBgColor = isDestructive
    ? 'rgba(239, 68, 68, 0.14)'
    : isWarning
    ? 'rgba(245, 158, 11, 0.15)'
    : colors.primaryMuted;

  const iconName: keyof typeof Ionicons.glyphMap =
    customIcon ||
    (isDestructive
      ? 'trash-outline'
      : isWarning
      ? 'alert-circle-outline'
      : 'checkmark-circle-outline');

  const handleDismiss = () => {
    const cancelBtn = buttons.find((b) => b.style === 'cancel');
    closeDialog();
    if (cancelBtn?.onPress) {
      cancelBtn.onPress();
    }
  };

  const handleButtonPress = (btn: DialogButton) => {
    try {
      if (btn.style === 'destructive') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {}

    closeDialog();
    if (btn.onPress) {
      btn.onPress();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: isDark
              ? 'rgba(5, 7, 10, 0.78)'
              : 'rgba(15, 23, 42, 0.52)',
          },
        ]}
      >
        <Pressable style={styles.backdrop} onPress={handleDismiss} />

        <View
          style={[
            styles.dialogCard,
            {
              backgroundColor: colors.surface,
              borderColor: isDestructive
                ? 'rgba(239, 68, 68, 0.35)'
                : colors.border,
              borderRadius: radius.xxl,
              padding: spacing.xl,
            },
          ]}
        >
          {/* Faixa superior sutil de destaque do tema */}
          <View
            style={[
              styles.topAccentBar,
              {
                backgroundColor: accentColor,
                borderTopLeftRadius: radius.xxl,
                borderTopRightRadius: radius.xxl,
              },
            ]}
          />

          {/* Ícone circular temático */}
          <View
            style={[
              styles.iconBadge,
              {
                backgroundColor: badgeBgColor,
                borderColor: isDestructive
                  ? 'rgba(239, 68, 68, 0.3)'
                  : isWarning
                  ? 'rgba(245, 158, 11, 0.3)'
                  : 'rgba(255, 42, 85, 0.3)',
              },
            ]}
          >
            <Ionicons name={iconName} size={26} color={accentColor} />
          </View>

          {/* Título */}
          <Text
            style={[
              typography.title2,
              styles.titleText,
              { color: colors.text },
            ]}
          >
            {title}
          </Text>

          {/* Mensagem */}
          {Boolean(message) && (
            <Text
              style={[
                typography.bodyMedium,
                styles.messageText,
                { color: colors.textSecondary },
              ]}
            >
              {message}
            </Text>
          )}

          {/* Botões de ação */}
          <View
            style={[
              styles.buttonsContainer,
              buttons.length > 2 && styles.buttonsVertical,
            ]}
          >
            {buttons.map((btn, idx) => {
              const isCancel = btn.style === 'cancel';
              const isBtnDestructive = btn.style === 'destructive';

              const btnBg = isCancel
                ? colors.surfaceElevated
                : isBtnDestructive
                ? colors.error
                : colors.primary;

              const btnBorder = isCancel
                ? colors.border
                : isBtnDestructive
                ? colors.error
                : colors.primary;

              const btnTextColor = isCancel ? colors.text : '#FFFFFF';

              return (
                <Pressable
                  key={`${btn.text}-${idx}`}
                  onPress={() => handleButtonPress(btn)}
                  style={({ pressed }) => [
                    styles.actionButton,
                    buttons.length <= 2 && { flex: 1 },
                    {
                      backgroundColor: btnBg,
                      borderColor: btnBorder,
                      borderRadius: radius.full,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={btn.text}
                >
                  <Text
                    style={[
                      typography.label,
                      styles.actionButtonText,
                      { color: btnTextColor },
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                  >
                    {btn.text}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 380,
    borderWidth: 1.5,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  topAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  titleText: {
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  messageText: {
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 22,
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  buttonsVertical: {
    flexDirection: 'column',
  },
  actionButton: {
    height: 46,
    paddingHorizontal: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
