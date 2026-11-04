import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  useWindowDimensions,
  PanResponder,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { manipulateAsync, SaveFormat, Action } from 'expo-image-manipulator';

interface PhotoCropperModalProps {
  visible: boolean;
  imageUri: string | null;
  initialWidth?: number;
  initialHeight?: number;
  onClose: () => void;
  onCropComplete: (croppedUri: string) => void;
}

export function PhotoCropperModal({
  visible,
  imageUri,
  initialWidth,
  initialHeight,
  onClose,
  onCropComplete,
}: PhotoCropperModalProps) {
  if (!visible || !imageUri) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <PhotoCropperView
        key={imageUri}
        imageUri={imageUri}
        initialWidth={initialWidth}
        initialHeight={initialHeight}
        onClose={onClose}
        onCropComplete={onCropComplete}
      />
    </Modal>
  );
}

interface PhotoCropperViewProps {
  imageUri: string;
  initialWidth?: number;
  initialHeight?: number;
  onClose: () => void;
  onCropComplete: (croppedUri: string) => void;
}

function PhotoCropperView({
  imageUri,
  initialWidth,
  initialHeight,
  onClose,
  onCropComplete,
}: PhotoCropperViewProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const [naturalWidth] = useState(initialWidth && initialWidth > 0 ? initialWidth : 1000);
  const [naturalHeight] = useState(initialHeight && initialHeight > 0 ? initialHeight : 1000);

  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const FRAME_SIZE = useMemo(() => {
    return Math.min(screenWidth - 32, 360);
  }, [screenWidth]);

  // Dimensões efetivas após rotação
  const { effW, effH } = useMemo(() => {
    const isPerp = rotation === 90 || rotation === 270;
    const w = isPerp ? naturalHeight : naturalWidth;
    const h = isPerp ? naturalWidth : naturalHeight;
    return {
      effW: w > 0 ? w : FRAME_SIZE,
      effH: h > 0 ? h : FRAME_SIZE,
    };
  }, [rotation, naturalWidth, naturalHeight, FRAME_SIZE]);

  // Escala base para cobrir o quadrado do crop
  const baseScale = useMemo(() => {
    return Math.max(FRAME_SIZE / effW, FRAME_SIZE / effH);
  }, [FRAME_SIZE, effW, effH]);

  const totalScale = baseScale * scale;
  const renderedW = effW * totalScale;
  const renderedH = effH * totalScale;

  // Limites de translação para manter o quadro sempre coberto
  const maxPanX = Math.max(0, (renderedW - FRAME_SIZE) / 2);
  const maxPanY = Math.max(0, (renderedH - FRAME_SIZE) / 2);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_evt, gestureState) => {
          setTranslateX((prev) =>
            Math.min(maxPanX, Math.max(-maxPanX, prev + gestureState.dx * 0.35))
          );
          setTranslateY((prev) =>
            Math.min(maxPanY, Math.max(-maxPanY, prev + gestureState.dy * 0.35))
          );
        },
      }),
    [maxPanX, maxPanY]
  );

  const handleRotate = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setRotation((prev) => ((prev + 90) % 360) as 0 | 90 | 180 | 270);
    setTranslateX(0);
    setTranslateY(0);
  };

  const handleZoom = (delta: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setScale((prev) => Math.min(3.5, Math.max(1, Number((prev + delta).toFixed(2)))));
  };

  const handleReset = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  };

  const handleCompleteCrop = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Calcula a área recortada em pixels reais da imagem original
      const leftInRendered = (renderedW - FRAME_SIZE) / 2 - translateX;
      const topInRendered = (renderedH - FRAME_SIZE) / 2 - translateY;

      const originX = Math.max(0, Math.round(leftInRendered / totalScale));
      const originY = Math.max(0, Math.round(topInRendered / totalScale));
      const cropW = Math.min(effW - originX, Math.round(FRAME_SIZE / totalScale));
      const cropH = Math.min(effH - originY, Math.round(FRAME_SIZE / totalScale));

      const actions: Action[] = [];
      if (rotation !== 0) {
        actions.push({ rotate: rotation });
      }
      actions.push({
        crop: {
          originX,
          originY,
          width: cropW,
          height: cropH,
        },
      });
      actions.push({
        resize: { width: 512, height: 512 },
      });

      const manipResult = await manipulateAsync(imageUri, actions, {
        compress: 0.85,
        format: SaveFormat.JPEG,
      });

      onCropComplete(manipResult.uri);
      onClose();
    } catch (err) {
      console.warn('Erro ao recortar imagem:', err);
      onCropComplete(imageUri);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Barra Superior - Idêntica à tela de edição com botão 'CONCLUIR' */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top + 8, 20) }]}>
        {/* Botão Voltar (Seta Esquerda) */}
        <Pressable
          onPress={onClose}
          style={styles.headerIconButton}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>

        {/* Ferramenta de rotação */}
        <View style={styles.topTools}>
          <Pressable
            onPress={handleRotate}
            style={styles.headerIconButton}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Girar 90 graus"
          >
            <Ionicons name="reload-outline" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Botão 'CONCLUIR' em substituição ao 'CORTAR' */}
        <Pressable
          onPress={handleCompleteCrop}
          disabled={isProcessing}
          style={({ pressed }) => [
            styles.concluirButton,
            { opacity: pressed || isProcessing ? 0.7 : 1 },
          ]}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Concluir edição de foto"
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.concluirButtonText}>CONCLUIR</Text>
          )}
        </Pressable>
      </View>

      {/* Área Central de Visualização e Ajuste do Crop */}
      <View style={styles.centerContainer} {...panResponder.panHandlers}>
        {/* Janela de Recorte (1:1) com Moldura e Grade de Terços */}
        <View style={[styles.cropFrame, { width: FRAME_SIZE, height: FRAME_SIZE }]}>
          {/* Imagem com transformações aplicadas */}
          <View
            style={[
              styles.imageTransformWrapper,
              {
                width: renderedW,
                height: renderedH,
                transform: [
                  { translateX },
                  { translateY },
                  { rotate: `${rotation}deg` },
                ],
              },
            ]}
          >
            <Image
              source={{ uri: imageUri }}
              style={styles.imageElement}
              contentFit="contain"
            />
          </View>

          {/* Grade 3x3 (Regra dos Terços) sobreposta */}
          <View style={styles.gridOverlay} pointerEvents="none">
            {/* Linhas horizontais */}
            <View style={[styles.gridLineH, { top: '33.33%' }]} />
            <View style={[styles.gridLineH, { top: '66.66%' }]} />
            {/* Linhas verticais */}
            <View style={[styles.gridLineV, { left: '33.33%' }]} />
            <View style={[styles.gridLineV, { left: '66.66%' }]} />

            {/* Cantos brancos em destaque (estilo visual do screenshot) */}
            <View style={[styles.cornerBracket, styles.cornerTL]} />
            <View style={[styles.cornerBracket, styles.cornerTR]} />
            <View style={[styles.cornerBracket, styles.cornerBL]} />
            <View style={[styles.cornerBracket, styles.cornerBR]} />
          </View>
        </View>
      </View>

      {/* Barra Inferior com Controles de Zoom e Ajuste */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 14, 28) }]}>
        <Text style={styles.instructionText}>
          Arraste a foto para ajustar o enquadramento
        </Text>

        <View style={styles.controlsRow}>
          {/* Diminuir Zoom */}
          <Pressable
            onPress={() => handleZoom(-0.25)}
            style={styles.controlPill}
            hitSlop={8}
          >
            <Ionicons name="remove" size={18} color="#FFFFFF" />
          </Pressable>

          {/* Redefinir Enquadramento */}
          <Pressable
            onPress={handleReset}
            style={[styles.controlPill, styles.controlPillWide]}
            hitSlop={8}
          >
            <Ionicons name="scan-outline" size={16} color="#FFFFFF" />
            <Text style={styles.controlPillText}>Centralizar</Text>
          </Pressable>

          {/* Aumentar Zoom */}
          <Pressable
            onPress={() => handleZoom(0.25)}
            style={styles.controlPill}
            hitSlop={8}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 20,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTools: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  concluirButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  concluirButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropFrame: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageTransformWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageElement: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFill,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  cornerBracket: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderColor: '#FFFFFF',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 20,
  },
  instructionText: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 14,
    textAlign: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  controlPill: {
    width: 44,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E222B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlPillWide: {
    width: 'auto',
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 6,
  },
  controlPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
