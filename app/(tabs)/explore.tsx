import React, { useEffect, useState } from "react";
import { StyleSheet, Image, Platform, ActivityIndicator, FlatList, View, Text } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { HelloWave } from "@/components/HelloWave";


const API_URL = "http://{`replace with IP address}:8000/api/photo/"; // Change this if deployed

type Photo = {
  PhotoID: number;
  FileName: string;
  TimeStamp: string;
};

export default function TabTwoScreen() {
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
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#02C9F1"
          name="camera.fill"
          style={styles.headerImage}
        />
      }
    >

    <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Displaying Your List of Photos</ThemedText>
          <HelloWave />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="title">Photo Shoots</ThemedText>
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
                <Image source={{ uri: `http://{`replace with IP adresss`}/api/photos/${item.PhotoID}.jpg` }} style={{ width: 100, height: 100 }} />
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

      <Collapsible title="File-based routing">
        <ThemedText>
          This app has two screens:{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
        </ThemedText>

        {Platform.select({
          ios: (
            <ThemedText>
              The <ThemedText type="defaultSemiBold">components/ParallaxScrollView.tsx</ThemedText>{' '}
              component provides a parallax effect for the header image.
            </ThemedText>
          ),
        })}
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  photoCard: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
});
