import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

// Assets WAV locais (100% offline e leves) gerados para sinais de início e fim
const startBeepAsset = require('../../assets/sounds/beep-start.wav');
const finishBeepAsset = require('../../assets/sounds/beep-finish.wav');

let startPlayer: AudioPlayer | null = null;
let finishPlayer: AudioPlayer | null = null;
let audioConfigured = false;

async function ensureAudioConfigured() {
  if (audioConfigured) return;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    });
    audioConfigured = true;
  } catch {
    // Ignora silenciosamente caso o dispositivo bloqueie configuração de áudio
  }
}

/**
 * Emite sinal tátil (haptics) + som curto de início via expo-audio
 */
export async function triggerTimerStartSignal(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch {}

  try {
    await ensureAudioConfigured();
    if (!startPlayer) {
      startPlayer = createAudioPlayer(startBeepAsset);
    }
    await startPlayer.seekTo(0);
    startPlayer.play();
  } catch {
    // Fallback seguro caso o áudio não esteja disponível no ambiente
  }
}

/**
 * Emite sinal tátil duplo (haptics) + som curto de conclusão via expo-audio
 */
export async function triggerTimerFinishSignal(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch {}
    }, 220);
  } catch {}

  try {
    await ensureAudioConfigured();
    if (!finishPlayer) {
      finishPlayer = createAudioPlayer(finishBeepAsset);
    }
    await finishPlayer.seekTo(0);
    finishPlayer.play();
  } catch {
    // Fallback seguro caso o áudio não esteja disponível no ambiente
  }
}
