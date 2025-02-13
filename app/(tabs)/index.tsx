import React from "react";
import { Image, StyleSheet, Platform, ActivityIndicator, FlatList, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // import navigation hook
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from "@/components/ui/IconSymbol";

export default function HomeScreen() {
  const navigation = useNavigation();

  const handleUploadPress = () => {
    navigation.navigate('photoUpload');  // Navigate to the PhotoUpload screen
  };

  const handleDeletePress = () => {
    navigation.navigate('PhotoDelete');  // Navigate to the PhotoDelete screen
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#02C9F1"
          name="photo.fill"
          style={styles.headerImage}
        />
      }
    >

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Upload or Delete Photos</ThemedText>
        </ThemedView>


      {/* Buttons */}
      <ThemedView style={styles.buttonContainer}>
        <TouchableOpacity style={styles.uploadButton} onPress={handleUploadPress}>
          <Text style={styles.buttonText}>Upload Photos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.deleteButton]} onPress={handleDeletePress}>
          <Text style={styles.buttonText}>Delete Photos</Text>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView>
        <ThemedText>
        This is where you will upload your pictures via Camera or Gallery. 
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  photoCard: {
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  photo: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: '#02C9F1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});