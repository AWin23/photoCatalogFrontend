import React, { useState } from 'react';
import { Text, View, Button, Alert, StyleSheet } from 'react-native';
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from '@/components/ThemedText';

import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from "expo-image-manipulator"; // Import ImageManipulator


export default function PhotoUpload() {
  const [image, setImage] = useState<string | null>(null); // State to hold the selected image

  // Function to convert HEIC to JPEG
  const convertToJpeg = async (uri: string): Promise<string> => {
    try {
      const converted = await ImageManipulator.manipulateAsync(
        uri,
        [],
        { format: ImageManipulator.SaveFormat.JPEG } // Convert HEIC → JPEG
      );
      return converted.uri; // Return new JPEG URI
    } catch (error) {
      console.error("Image conversion error:", error);
      return uri; // Fallback to original URI if conversion fails
    }
  };

// Function to upload image to backend
const uploadImage = async (uri: string) => {
  console.log("UPLOAD IMAGE IS HIT");
  try {
    const jpegUri = await convertToJpeg(uri); // Convert HEIC → JPEG
    console.log("JPEG Image URI:", jpegUri); // Debugging

    // Instead of using fetch() to get a blob, append the URI directly
    const formData = new FormData();
    formData.append("image", {
      uri: jpegUri,
      type: "image/jpg",
      name: "upload.jpg",
    });

    console.log("FormData created. Sending request...");
    console.log("Jpeg URI:", jpegUri);

    const uploadResponse = await fetch("http://{replace with your ID}/api/photo/create/", {
      method: "POST",
      headers: {}, // No Content-Type, let the browser handle it
      body: formData,
    });

    console.log("Upload response:", uploadResponse);

    // Check if response is JSON before parsing
    const contentType = uploadResponse.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await uploadResponse.json();
      console.log("Data payload:", data);
    } else {
      const errorText = await uploadResponse.text();
      console.error("Server response is not JSON:", errorText);
    }
    
  } catch (error) {
    console.error("Uploading Image Error:", error);
  }
};

  

// Function to open the camera
const openCamera = async () => {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    alert("Camera permission is required");
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  if (!result.canceled && result.assets.length > 0) {
    const selectedUri = result.assets[0].uri; // Correctly accessing the URI
    setImage(selectedUri); // Set the selected image
    uploadImage(selectedUri);
  }
};

// Function to open the gallery
const openGallery = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    alert("Gallery permission is required");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  if (!result.canceled && result.assets.length > 0) {
    const selectedUri = result.assets[0].uri; // Correctly accessing the URI
    setImage(selectedUri); // Set the selected image
    uploadImage(selectedUri);
  }
};


  return (
    <View style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#666666',
  },
})
