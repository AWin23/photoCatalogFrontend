import React, { useEffect, useState } from "react";
import { StyleSheet, Image, ActivityIndicator, FlatList, View, Text } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

import { LinearGradient } from 'expo-linear-gradient';


const API_URL = "http://{replace with your IP}:8000/api/photo/"; // Change this if deployed

type Photo = {
  PhotoID: number;
  FileName: string;
  TimeStamp: string;
  ImagePath: string;
};

export default function TabTwoScreen() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);  // New state for pull-to-refresh


  const fetchPhotos = async () => {
    setLoading(true);  // Ensure loading is true when fetching data
    try {
      console.log("Fetching from: ", API_URL);
      const response = await fetch(API_URL);
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
  
    return (
      <View style={styles.container}>
        {/* Left Railing */}
        <LinearGradient colors={['#2c2c2c', '#4a4a4a']} style={styles.railLeft} />
  
        {/* Main Content */}
        <View style={styles.content}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Displaying Your List of Photos</ThemedText>
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
                    <Image source={{ uri: `http://{replace with your IP}:8000/api${item.ImagePath}` }} style={styles.pictureItself} />
                  ) : (
                    <IconSymbol size={24} name="photo.fill" color="blue" />
                  )}
                  <Text>{item.PhotoID}</Text>
                  <Text>{item.TimeStamp || 'No Timestamp'}</Text>
                </View>
              )}
              onRefresh={fetchPhotos}
              refreshing={refreshing}
            />
          )}
        </View>
  
        {/* Right Railing */}
        <LinearGradient colors={['#2c2c2c', '#4a4a4a']} style={styles.railRight} />
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row', // Railings + Main Content
    backgroundColor: '#1e1e1e', // Dark background for modern look
  },
  railLeft: {
    width: 20, // Width of the left railing
    height: '100%',
  },
  railRight: {
    width: 20, // Width of the right railing
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
    marginTop: 30,
    paddingTop: 30,
    paddingBottom: 15,
    borderRadius: 10,
    paddingLeft: 10,
    paddingRight: 10,
  },
  photoCard: {
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#e2e5de', // Dark grayish tone
    borderRadius: 12, // Modern rounded edges
    marginHorizontal: 10,
    width: '95%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6, // Android shadow effect
  },
  pictureItself: {
    width: 200,
    height: 200,
    transform: [{ scale: 1 }],
    borderRadius: 10, // Slight roundness for a smooth look
  },
});

