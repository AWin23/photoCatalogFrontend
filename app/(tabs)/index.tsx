import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Platform, ActivityIndicator } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from "@/components/ui/IconSymbol";


const API_URL = "http://localhost:8000/api/photos/"; // Change this if deployed

type Photo = {
  id: number;
  file_name: string;
  image_url: string; // make sure Django API returns this URL
}

export default function HomeScreen() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        const data: Photo[] = await response.json();
        setPhotos(data);
      } catch (err: any) {
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

        {/* {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : error ? (
          <ThemedText type="error">Error: {error}</ThemedText>
        ) : (
          <FlatList
            data={photos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.photoCard}>
                <Image source={{ uri: item.image_url }} style={styles.photo} />
                <ThemedText>{item.file_name}</ThemedText>
              </View>
            )}
          />
        )} */}


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
});
