import { StyleSheet, Image, Platform, TouchableOpacity, Text } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabTwoScreen() {
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
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Photo Shoots</ThemedText>
      </ThemedView>

      {/* Buttons */}
      <ThemedView style={"styles.buttonContainer"}>
        <TouchableOpacity style={styles.uploadButton}>
          <Text style={styles.buttonText}>Upload Photos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.deleteButton]}>
          <Text style={styles.buttonText}>Delete Photos</Text>
        </TouchableOpacity>
      </ThemedView> 


      <ThemedText>This is where you will upload your pictures via Camera or Gallery.</ThemedText>
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
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
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
    borderRadius: 20, // Rounded rectangle shape
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20, // Rounded rectangle shape
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

{/* <ThemedText>
  The layout file in <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
  sets up the tab navigator.
</ThemedText>
<ExternalLink href="https://docs.expo.dev/router/introduction">
  <ThemedText type="link">Learn more</ThemedText>
</ExternalLink>
</Collapsible>
<Collapsible title="Android, iOS, and web support">
<ThemedText>
  You can open this project on Android, iOS, and the web. To open the web version, press{' '}
  <ThemedText type="defaultSemiBold">w</ThemedText> in the terminal running this project.
</ThemedText>
</Collapsible>
<Collapsible title="Images">
<ThemedText>
  For static images, you can use the <ThemedText type="defaultSemiBold">@2x</ThemedText> and{' '}
  <ThemedText type="defaultSemiBold">@3x</ThemedText> suffixes to provide files for
  different screen densities
</ThemedText>
<Image source={require('@/assets/images/react-logo.png')} style={{ alignSelf: 'center' }} />
<ExternalLink href="https://reactnative.dev/docs/images">
  <ThemedText type="link">Learn more</ThemedText>
</ExternalLink>
</Collapsible>
<Collapsible title="Custom fonts">
<ThemedText>
  Open <ThemedText type="defaultSemiBold">app/_layout.tsx</ThemedText> to see how to load{' '}
  <ThemedText style={{ fontFamily: 'SpaceMono' }}>
    custom fonts such as this one.
  </ThemedText>
</ThemedText>
<ExternalLink href="https://docs.expo.dev/versions/latest/sdk/font">
  <ThemedText type="link">Learn more</ThemedText>
</ExternalLink>
</Collapsible>
<Collapsible title="Light and dark mode components">
<ThemedText>
  This template has light and dark mode support. The{' '}
  <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> hook lets you inspect
  what the user's current color scheme is, and so you can adjust UI colors accordingly.
</ThemedText>
<ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
  <ThemedText type="link">Learn more</ThemedText>
</ExternalLink>
</Collapsible>
<Collapsible title="Animations">
<ThemedText>
  This template includes an example of an animated component. The{' '}
  <ThemedText type="defaultSemiBold">components/HelloWave.tsx</ThemedText> component uses
  the powerful <ThemedText type="defaultSemiBold">react-native-reanimated</ThemedText>{' '}
  library to create a waving hand animation.
</ThemedText> */}