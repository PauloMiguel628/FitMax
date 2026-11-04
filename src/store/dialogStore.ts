import { create } from 'zustand';
import { Ionicons } from '@expo/vector-icons';

export interface DialogButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

export type DialogVariant = 'default' | 'destructive' | 'warning';

export interface DialogOptions {
  title: string;
  message?: string;
  buttons?: DialogButton[];
  variant?: DialogVariant;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface DialogState {
  visible: boolean;
  title: string;
  message?: string;
  buttons: DialogButton[];
  variant: DialogVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  openDialog: (options: DialogOptions) => void;
  closeDialog: () => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  visible: false,
  title: '',
  message: undefined,
  buttons: [],
  variant: 'default',
  icon: undefined,
  openDialog: (options) => {
    const buttons: DialogButton[] =
      options.buttons && options.buttons.length > 0
        ? options.buttons
        : [{ text: 'OK', style: 'default' }];

    const hasDestructive = buttons.some((b) => b.style === 'destructive');
    const inferredVariant: DialogVariant =
      options.variant || (hasDestructive ? 'destructive' : buttons.length === 1 ? 'warning' : 'default');

    set({
      visible: true,
      title: options.title,
      message: options.message,
      buttons,
      variant: inferredVariant,
      icon: options.icon,
    });
  },
  closeDialog: () =>
    set({
      visible: false,
    }),
}));

/**
 * Helper global compatível com a assinatura de Alert.alert(title, message, buttons),
 * exibindo uma caixa de diálogo estilizada com o tema ativo do FitMax (Escuro / Claro).
 */
export function showAppDialog(
  title: string,
  message?: string,
  buttons?: DialogButton[],
  extra?: { variant?: DialogVariant; icon?: keyof typeof Ionicons.glyphMap }
) {
  useDialogStore.getState().openDialog({
    title,
    message,
    buttons,
    variant: extra?.variant,
    icon: extra?.icon,
  });
}
