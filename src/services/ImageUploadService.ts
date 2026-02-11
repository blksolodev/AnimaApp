// Anima - Image Upload Service
// Handle image uploads to Firebase Storage

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { getFirebaseStorage } from './FirebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export interface UploadProgress {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
}

export interface ImagePickerResult {
  uri: string;
  width: number;
  height: number;
  cancelled: boolean;
}

// Request camera permissions
export const requestCameraPermissions = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
};

// Request media library permissions
export const requestMediaLibraryPermissions = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
};

// Pick image from library
export const pickImage = async (options?: {
  aspect?: [number, number];
  quality?: number;
  allowsEditing?: boolean;
}): Promise<ImagePickerResult | null> => {
  const hasPermission = await requestMediaLibraryPermissions();
  if (!hasPermission) {
    throw new Error('Media library permission not granted');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: options?.allowsEditing ?? true,
    aspect: options?.aspect ?? [1, 1],
    quality: options?.quality ?? 0.8,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    cancelled: false,
  };
};

// Take photo with camera
export const takePhoto = async (options?: {
  aspect?: [number, number];
  quality?: number;
  allowsEditing?: boolean;
}): Promise<ImagePickerResult | null> => {
  const hasPermission = await requestCameraPermissions();
  if (!hasPermission) {
    throw new Error('Camera permission not granted');
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: options?.allowsEditing ?? true,
    aspect: options?.aspect ?? [1, 1],
    quality: options?.quality ?? 0.8,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    cancelled: false,
  };
};

// Compress and resize image
export const processImage = async (
  uri: string,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  }
): Promise<string> => {
  const maxWidth = options?.maxWidth ?? 800;
  const maxHeight = options?.maxHeight ?? 800;
  const quality = options?.quality ?? 0.8;

  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: maxWidth, height: maxHeight } }],
    { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
  );

  return result.uri;
};

// Convert URI to blob for upload
const uriToBlob = async (uri: string): Promise<Blob> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
};

// Upload image to Firebase Storage
export const uploadImage = async (
  uri: string,
  path: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  const storage = getFirebaseStorage();
  const blob = await uriToBlob(uri);
  const storageRef = ref(storage, path);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.({
          progress,
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
        });
      },
      (error) => {
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};

// Upload profile avatar
export const uploadAvatar = async (
  userId: string,
  uri: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  // Process image for optimal size
  const processedUri = await processImage(uri, {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.85,
  });

  const timestamp = Date.now();
  const path = `avatars/${userId}/avatar_${timestamp}.jpg`;

  return uploadImage(processedUri, path, onProgress);
};

// Upload profile banner
export const uploadBanner = async (
  userId: string,
  uri: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  // Process image for optimal size
  const processedUri = await processImage(uri, {
    maxWidth: 1200,
    maxHeight: 400,
    quality: 0.85,
  });

  const timestamp = Date.now();
  const path = `banners/${userId}/banner_${timestamp}.jpg`;

  return uploadImage(processedUri, path, onProgress);
};

// Upload post media
export const uploadPostMedia = async (
  userId: string,
  postId: string,
  uri: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  const processedUri = await processImage(uri, {
    maxWidth: 1080,
    maxHeight: 1920,
    quality: 0.85,
  });

  const timestamp = Date.now();
  const path = `posts/${userId}/${postId}/media_${timestamp}.jpg`;

  return uploadImage(processedUri, path, onProgress);
};

// Delete image from storage
export const deleteImage = async (url: string): Promise<void> => {
  const storage = getFirebaseStorage();
  const imageRef = ref(storage, url);
  await deleteObject(imageRef);
};

// Generate avatar placeholder URL
export const getAvatarPlaceholder = (name: string): string => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Using UI Avatars service as placeholder
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=FF6B2C&color=fff&size=200`;
};

// Default avatar options for selection
export const DEFAULT_AVATARS = [
  { id: 'avatar_1', url: 'https://api.dicebear.com/7.x/bottts-neutral/png?seed=anima1' },
  { id: 'avatar_2', url: 'https://api.dicebear.com/7.x/bottts-neutral/png?seed=anima2' },
  { id: 'avatar_3', url: 'https://api.dicebear.com/7.x/bottts-neutral/png?seed=anima3' },
  { id: 'avatar_4', url: 'https://api.dicebear.com/7.x/bottts-neutral/png?seed=anima4' },
  { id: 'avatar_5', url: 'https://api.dicebear.com/7.x/bottts-neutral/png?seed=anima5' },
  { id: 'avatar_6', url: 'https://api.dicebear.com/7.x/bottts-neutral/png?seed=anima6' },
  { id: 'avatar_7', url: 'https://api.dicebear.com/7.x/lorelei/png?seed=anima1' },
  { id: 'avatar_8', url: 'https://api.dicebear.com/7.x/lorelei/png?seed=anima2' },
];
