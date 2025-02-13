import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Platform, ActivityIndicator, FlatList, View, Text } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from "@/components/ui/IconSymbol";


const API_URL = "http://{'replace with IP address'}/api/photo/"; // Change this if deployed

type Photo = {
  PhotoID: number;
  FileName: string;
  TimeStamp: string;
}

export default function HomeScreen() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      console.log("Fetching from: ", API_URL);
      try {
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
      }
    };
  
    fetchPhotos();
  }, []);
  
  

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
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Displaying Photos</ThemedText>
        <HelloWave />
      </ThemedView>


      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Make a GET REQUEST to display all existing photos</ThemedText>

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
              {/* Show image if FileName exists, otherwise show default icon */}
              {item.FileName ? (
                <Image source={{ uri: `http://{`replace with ip address for now`}/api/photos/${item.PhotoID}.jpg` }} style={{ width: 100, height: 100 }} />
              ) : (
                <IconSymbol size={24} name="photo.fill" color="black" />
              )}
              <Text>{item.FileName || 'No Filename'}</Text>
              <Text>{item.PhotoID}</Text>
              <Text>{item.TimeStamp || 'No Timestamp'}</Text>
            </View>
          )}
        />
      )}

        <ThemedText>
          Here is supposed to display rows of photos from the DB. 
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12'
            })}
          </ThemedText>{' '}
          to open developer tools.
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
});
