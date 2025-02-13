import React, { useState } from 'react';
import { Text, View, Button, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from '@/components/ThemedText';

export default function PhotoUpload() {
  const [image, setImage] = useState(null); // State to hold the selected image

  // Function to open the camera
  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.granted) {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.cancelled) {
        setImage(result.uri); // Set the selected image
      }
    } else {
      alert('Camera permission is required');
    }
  };

  // Function to open the gallery
  const openGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.granted) {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.cancelled) {
        setImage(result.uri); // Set the selected image
      }
    } else {
      alert('Gallery permission is required');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "silver" }}>
      <ThemedText type="title">Upload Options</ThemedText>      

      {/* Display the selected image */}
      {image && <IconSymbol size={24} name="photo.fill" color="white" />}

      {/* Camera Button */}
      <Button title="Camera" onPress={openCamera} />

      {/* Gallery Button */}
      <Button title="Gallery" onPress={openGallery} />

    </View>
  );
}
