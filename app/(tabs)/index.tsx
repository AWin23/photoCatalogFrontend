import React, { useEffect, useState } from "react";
import {  StyleSheet, Image, Platform, ActivityIndicator, FlatList, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // import navigation hook
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import { LinearGradient } from 'expo-linear-gradient';

const PHOTO_API_URL = "http://{replace with your IP}:8000/api/photo/"; // Change this if deployed
const BASE_URL = "http://{replace with your IP}:8000/"; // replace first part with your real IP

type Photo = {
  PhotoID: number;
  FileName: string;
  TimeStamp: string;
  ImagePath: string;
};

export default function HomeScreen({ }) {

    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);  // New state for pull-to-refresh

      const fetchPhotos = async () => {
        setLoading(true);  // Ensure loading is true when fetching data
        try {
          console.log("Fetching from: ", PHOTO_API_URL);
          const response = await fetch(PHOTO_API_URL);
          console.log("Response Status:", response.status);
          if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
          }
          const data: Photo[] = await response.json();
          console.log("Fetched Data:", data);
    
          // Ensure photos array has valid objects, and handle null or undefined values
          const validPhotos = data.map(photo => ({
            ...photo,
            FileName: photo.FileName || 'No Filename', // Fallback for null or undefined FileName
            TimeStamp: photo.TimeStamp || 'No Timestamp' // Fallback for null or undefined TimeStamp
          }));
    
          setPhotos(validPhotos); // Set the processed data
        } catch (err: any) {
          console.error("Fetch Error:", err);
          setError(err.message);
        } finally {
          setLoading(false);
          setRefreshing(false);  // Stop refreshing when the fetch is done
        }
      };
    
      // Call fetchPhotos initially and on refresh
      useEffect(() => {
        fetchPhotos();
      }, []);
  

  const navigation = useNavigation();

  const handleUploadPress = () => {
    navigation.navigate('photoUpload');  // Navigate to the PhotoUpload screen
  };

  const handleDeletePress = () => {
    navigation.navigate('photoDelete');  // Navigate to the PhotoDelete screen
  };

  return (
    <View style={styles.container}>
      {/* Left Railing */}
      <LinearGradient colors={['#2c2c2c', '#4a4a4a']} style={styles.railLeft} />
      
      {/* Main Content */}
      <View style={styles.content}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Displaying Your List of Photos📸</ThemedText>
        </ThemedView>

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : error ? (
          <ThemedText type="error">Error: {error}</ThemedText>
        ) : (
          <FlatList
            data={photos}
            keyExtractor={(item) => item.PhotoID.toString()}
            renderItem={({ item }) => (
              <View style={styles.photoCard}>
                {item.FileName ? (
                  <Image source={{ uri: `${BASE_URL}api${item.ImagePath}` }} style={styles.photo} />
                ) : (
                  <Text style={styles.placeholder}>No Image</Text>
                )}
                <Text>{item.PhotoID}</Text>
                <Text>{item.TimeStamp || 'No Timestamp'}</Text>
              </View>
            )}
            onRefresh={fetchPhotos}
            refreshing={refreshing}
          />
        )}

        {/* Upload & Delete Buttons */}
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Upload or Delete Photos</ThemedText>
          <Text style={styles.helperText}>Click here to add or delete photos</Text>

        <ThemedView style={styles.buttonContainer}>
          <TouchableOpacity style={styles.uploadButton} onPress={handleUploadPress}>
            <Text style={styles.buttonText}>Upload Photos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
            <Text style={styles.buttonText}>Delete Photos</Text>
          </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </View>

      {/* Right Railing */}
      <LinearGradient colors={['#2c2c2c', '#4a4a4a']} style={styles.railRight} />
    </View>
  );
}

const styles = StyleSheet.create({
  helperText: {
    color: "white",
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#1e1e1e',
  },
  railLeft: {
    width: 12,
    height: '100%',
  },
  railRight: {
    width: 12,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    paddingBottom: 90,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    paddingTop: 15,
    paddingBottom: 15,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  photoCard: {
    alignItems: 'center',
    padding: 12, // Slightly more padding for better spacing
    marginBottom: 12,
    backgroundColor: '#e2e5de', // Dark grayish tone
    borderRadius: 14, // Modern rounded edges
    marginHorizontal: 10,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 }, // Slightly increased shadow
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 7, // Stronger Android shadow effect
  },
  
  photo: {
    width: 230, // Increased width for better clarity
    height: 230, // Increased height to match proportionally
    transform: [{ scale: 1 }],
    borderRadius: 12, // Slightly more roundness for a smooth look
  },
  placeholder: {
    fontSize: 16,
    color: 'gray',
  },
  stepContainer: {
    gap: 8,
    marginBottom: 2,
    paddingTop: 10,
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: '#02C9F1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 8,
    paddingHorizontal: 16,
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
