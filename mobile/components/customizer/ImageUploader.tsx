import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { uploadDesignImage } from '@/lib/api/client';
import { getSessionId } from '@/lib/utils/session';

interface ImageUploaderProps {
  currentImage: string | null;
  placement: string;
  onImageChange: (imageUrl: string | null, imageId?: string | null) => void;
  onLoading?: (loading: boolean) => void;
}

export function ImageUploader({
  currentImage,
  placement,
  onImageChange,
  onLoading,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to upload images.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (result.canceled || !result.assets[0].base64) {
        return;
      }

      setUploading(true);
      onLoading?.(true);

      const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
      const sessionId = await getSessionId();

      try {
        const response = await uploadDesignImage({
          base64,
          placement,
          sessionId,
        });

        onImageChange(response.url, response.id);
      } catch (uploadError) {
        console.warn('Upload failed, using local image:', uploadError);
        onImageChange(base64);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setUploading(false);
      onLoading?.(false);
    }
  };

  const handleRemoveImage = () => {
    onImageChange(null, null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Upload Image</Text>

      {currentImage ? (
        <View style={styles.imageRow}>
          <View style={styles.imagePreview}>
            <Image
              source={{ uri: currentImage }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
          <View style={styles.buttonColumn}>
            <TouchableOpacity
              onPress={handlePickImage}
              disabled={uploading}
              style={styles.changeButton}
            >
              <Ionicons name="refresh" size={18} color="#6b7280" />
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleRemoveImage}
              style={styles.removeButton}
            >
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={handlePickImage}
          disabled={uploading}
          style={styles.uploadArea}
        >
          {uploading ? (
            <>
              <Ionicons name="cloud-upload" size={32} color="#0891b2" />
              <Text style={styles.uploadingText}>Uploading...</Text>
            </>
          ) : (
            <>
              <Ionicons name="image-outline" size={32} color="#9ca3af" />
              <Text style={styles.uploadText}>Tap to upload image</Text>
              <Text style={styles.uploadHint}>PNG, JPG up to 5MB</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  label: {
    marginBottom: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  imageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    gap: 16,
  },
  imagePreview: {
    width: 72,
    height: 72,
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  buttonColumn: {
    flex: 1,
    gap: 8,
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 10,
  },
  changeText: {
    marginLeft: 8,
    fontWeight: '500',
    color: '#374151',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingVertical: 10,
  },
  removeText: {
    marginLeft: 8,
    fontWeight: '500',
    color: '#dc2626',
  },
  uploadArea: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e5e7eb',
    backgroundColor: '#fafafa',
    paddingVertical: 40,
  },
  uploadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#0891b2',
  },
  uploadText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  uploadHint: {
    marginTop: 4,
    fontSize: 13,
    color: '#9ca3af',
  },
});
