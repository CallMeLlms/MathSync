import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VIDEO_CACHE_KEY_PREFIX = '@offline_video_';

/**
 * Generates a consistent filename from a URL
 */
const getFilenameFromUrl = (url) => {
  // Extract filename or create hash/safe string from URL
  const hash = url.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  // Add .mp4 extension assuming we are downloading mp4s, or try to get from url
  const extension = url.split('.').pop().split('?')[0];
  const ext = ['mp4', 'mov', 'm4v'].includes(extension) ? extension : 'mp4';
  return `video_${Math.abs(hash)}.${ext}`;
};

/**
 * Checks if a video is already downloaded
 */
export const getLocalVideoUri = async (remoteUrl) => {
  try {
    const localUri = await AsyncStorage.getItem(`${VIDEO_CACHE_KEY_PREFIX}${remoteUrl}`);
    if (localUri) {
      // Verify file still exists
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (fileInfo.exists) {
        return localUri;
      } else {
        // Cleanup storage if file was deleted externally
        await AsyncStorage.removeItem(`${VIDEO_CACHE_KEY_PREFIX}${remoteUrl}`);
      }
    }
  } catch (error) {
    console.error('Error getting local video URI:', error);
  }
  return null;
};

/**
 * Downloads a video from a remote URL to the local file system
 */
export const downloadVideo = async (remoteUrl, onProgress) => {
  try {
    const filename = getFilenameFromUrl(remoteUrl);
    const fileUri = `${FileSystem.documentDirectory}${filename}`;
    
    const downloadResumable = FileSystem.createDownloadResumable(
      remoteUrl,
      fileUri,
      {},
      (downloadProgress) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        if (onProgress) onProgress(progress);
      }
    );

    const { uri } = await downloadResumable.downloadAsync();
    
    // Save mapping to AsyncStorage
    await AsyncStorage.setItem(`${VIDEO_CACHE_KEY_PREFIX}${remoteUrl}`, uri);
    
    return uri;
  } catch (error) {
    console.error('Error downloading video:', error);
    throw error;
  }
};

/**
 * Deletes a downloaded video from the local file system
 */
export const deleteVideo = async (remoteUrl) => {
  try {
    const localUri = await AsyncStorage.getItem(`${VIDEO_CACHE_KEY_PREFIX}${remoteUrl}`);
    if (localUri) {
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(localUri);
      }
      await AsyncStorage.removeItem(`${VIDEO_CACHE_KEY_PREFIX}${remoteUrl}`);
    }
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
};
