import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Feather } from '@expo/vector-icons';
import { getLocalVideoUri, downloadVideo, deleteVideo } from '../../utils/downloadManager';

const OfflineVideoPlayer = ({ url, style, videoStyle }) => {
  const [localUri, setLocalUri] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [checkingCache, setCheckingCache] = useState(true);

  useEffect(() => {
    checkCache();
  }, [url]);

  const checkCache = async () => {
    setCheckingCache(true);
    try {
      if (url) {
        const uri = await getLocalVideoUri(url);
        setLocalUri(uri);
      }
    } catch (err) {
      console.error('Cache check failed:', err);
    } finally {
      setCheckingCache(false);
    }
  };

  const handleDownload = async () => {
    if (!url) return;
    setIsDownloading(true);
    setError(null);
    setDownloadProgress(0);
    try {
      const uri = await downloadVideo(url, (progress) => {
        setDownloadProgress(progress);
      });
      setLocalUri(uri);
    } catch (err) {
      setError('Failed to download video. Check your connection and try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!url) return;
    try {
      await deleteVideo(url);
      setLocalUri(null);
    } catch (err) {
      console.error('Failed to delete video:', err);
      setError('Failed to delete video.');
    }
  };

  if (!url) {
      return null;
  }

  if (checkingCache) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator color="#4B7BF5" />
      </View>
    );
  }

  const currentSource = localUri ? { uri: localUri } : { uri: url };

  return (
    <View style={[styles.wrapper, style]}>
      <View style={[styles.container, videoStyle]}>
        <Video
          style={styles.video}
          source={currentSource}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping={false}
        />
      </View>
      
      <View style={styles.controlsContainer}>
        {localUri ? (
          <View style={styles.downloadedStatus}>
             <View style={styles.downloadedRow}>
               <Feather name="check-circle" size={16} color="#4CAF50" />
               <Text style={styles.downloadedText}>Available Offline</Text>
             </View>
             <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                <Feather name="trash-2" size={16} color="#F44336" />
                <Text style={styles.deleteText}>Remove</Text>
             </TouchableOpacity>
          </View>
        ) : isDownloading ? (
          <View style={styles.downloadingStatus}>
             <ActivityIndicator size="small" color="#4B7BF5" />
             <Text style={styles.downloadingText}>
                Downloading... {Math.round(downloadProgress * 100)}%
             </Text>
          </View>
        ) : (
          <TouchableOpacity onPress={handleDownload} style={styles.downloadButton}>
             <Feather name="download-cloud" size={18} color="#4B7BF5" />
             <Text style={styles.downloadButtonText}>Download for Offline Use</Text>
          </TouchableOpacity>
        )}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginVertical: 12,
  },
  container: {
    width: '100%',
    height: 220,
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    // No shadows rule
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controlsContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  downloadButtonText: {
    color: '#4B7BF5',
    fontFamily: 'PlusJakartaSans-SemiBold',
    marginLeft: 8,
    fontSize: 14,
  },
  downloadingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  downloadingText: {
    color: '#4B7BF5',
    fontFamily: 'PlusJakartaSans-Medium',
    marginLeft: 8,
    fontSize: 14,
  },
  downloadedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 8,
  },
  downloadedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadedText: {
    color: '#4CAF50',
    fontFamily: 'PlusJakartaSans-SemiBold',
    marginLeft: 6,
    fontSize: 14,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteText: {
    color: '#F44336',
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    marginLeft: 4,
  },
  errorText: {
    color: '#F44336',
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  }
});

export default OfflineVideoPlayer;
