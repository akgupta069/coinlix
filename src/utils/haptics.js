import * as Haptics from 'expo-haptics';

export const tapLight = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
export const tapMedium = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
export const success = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
export const warning = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
export const error = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
