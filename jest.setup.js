import 'react-native-gesture-handler/jestSetup';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-vision-camera
jest.mock('react-native-vision-camera', () => ({
  Camera: 'Camera',
  useCameraDevices: () => ({
    back: { id: 'back' },
    front: { id: 'front' },
  }),
  useFrameProcessor: () => ({}),
}));

// Mock react-native-vision-camera-text-recognition
jest.mock('react-native-vision-camera-text-recognition', () => ({
  useTextRecognition: () => ({
    recognizeText: jest.fn().mockResolvedValue({
      textBlocks: [
        {
          text: 'Test Product',
          confidence: 0.9,
        },
      ],
    }),
  }),
}));

// Mock react-native-sqlite-storage
jest.mock('react-native-sqlite-storage', () => ({
  DEBUG: jest.fn(),
  enablePromise: jest.fn(),
  openDatabase: jest.fn().mockResolvedValue({
    executeSql: jest.fn().mockResolvedValue([[]]),
  }),
}));

// Mock react-native-permissions
jest.mock('react-native-permissions', () => ({
  request: jest.fn().mockResolvedValue('granted'),
  check: jest.fn().mockResolvedValue('granted'),
  PERMISSIONS: {
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
    },
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
    },
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
  },
}));

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));
