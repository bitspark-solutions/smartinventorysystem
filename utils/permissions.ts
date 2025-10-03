import { Platform } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

/**
 * Request camera permission for the current platform
 * @returns Promise<boolean> - true if permission granted, false otherwise
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const permission = Platform.OS === 'ios'
      ? PERMISSIONS.IOS.CAMERA
      : PERMISSIONS.ANDROID.CAMERA;

    const result = await request(permission);

    return result === RESULTS.GRANTED;
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return false;
  }
};

/**
 * Check if camera permission is already granted
 * @returns Promise<boolean> - true if permission granted, false otherwise
 */
export const checkCameraPermission = async (): Promise<boolean> => {
  try {
    const permission = Platform.OS === 'ios'
      ? PERMISSIONS.IOS.CAMERA
      : PERMISSIONS.ANDROID.CAMERA;

    const result = await request(permission);

    return result === RESULTS.GRANTED;
  } catch (error) {
    console.error('Error checking camera permission:', error);
    return false;
  }
};
