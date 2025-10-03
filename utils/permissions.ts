import * as ImagePicker from 'expo-image-picker';

/**
 * Request camera permission for the current platform
 * @returns Promise<boolean> - true if permission granted, false otherwise
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status === 'granted') {
      return true;
    }

    // On Android, we might need media library permission too for camera
    if (status === 'denied') {
      console.log('Camera permission denied');
      return false;
    }

    return false;
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
    const { status } = await ImagePicker.getCameraPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking camera permission:', error);
    return false;
  }
};
