import React, { useState, useEffect } from 'react';
import { TextInput, View, Button, Text, Alert, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

const PhotoDelete = () => {
  const [photoID, setPhotoID] = useState<string>(''); // Ensure photoID is always a string
  const [message, setMessage] = useState<string>('');
  const [fetchedData, setFetchedData] = useState<any[]>([]); // State to hold fetched photo data

  // Function to fetch the photo data
  const fetchPhotos = async () => {
    try {
      const response = await fetch('http://{replace with your IP}/api/photo'); // Adjust the URL to your API endpoint
      if (response.ok) {
        const data = await response.json();
        setFetchedData(data); // Store the fetched data in the state
      } else {
        setMessage('Failed to fetch photos');
      }
    } catch (error) {
      setMessage('Error fetching photos');
    }
  };

  // Fetch photos when the component mounts
  useEffect(() => {
    fetchPhotos();
  }, []);

  // function to handle Delete of the Photo
  const handleDelete = async () => {
    const parsedPhotoID = parseInt(photoID, 10); // Ensure photoID is a number

    // Check if PhotoID is valid (exists in the fetchedData array)
    const photoExists = fetchedData.some(item => item.PhotoID === parsedPhotoID);

    if (!photoID || isNaN(parsedPhotoID) || !photoExists) {
      setMessage('Invalid photo ID');
      return;
    }

    console.log("Current ParsedPhotoID: " + parsedPhotoID);
    
    try {
        const response = await fetch(`http://{replace with your IP}:8000/api/photo/${parsedPhotoID}`, {
            method: 'DELETE',
        });
        
        console.log(`Current Delete URL: http://{replace with your IP}:8000/api/photo/${parsedPhotoID}`);

      if (response.ok) {
        setMessage('Photo deleted successfully');
      } else {
        const errorText = await response.text();  // Read server response for debugging
        setMessage(`Failed to delete photo: ${errorText}`);
      }
    } catch (error) {
      setMessage('Error deleting photo');
    }
  };

  return (
    <View style={styles.container}>
    <ThemedText type="title">Upload Options</ThemedText>        
      <TextInput
        style={styles.input}
        placeholder="Enter PhotoID"
        keyboardType="numeric"
        value={photoID}
        onChangeText={(text) => setPhotoID(text)}
      />
      <Text style={styles.buttonText} onPress={handleDelete}>Delete Photo</Text>
      <ThemedText>{message}</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: '#666666',
      paddingTop: 50,
    },
    input: {
        height: 40,
        borderColor: 'black', // Black border color
        borderWidth: 2, // Thicker black border
        width: '80%',
        marginBottom: 10,
        paddingLeft: 10,
        color: 'black', // Black text color
    },

    button: {
      backgroundColor: 'red', // Red color
      padding: 20, // Space inside the button to make it square
      width: 150, // Fixed width and height to make it square
      height: 150,
      justifyContent: 'center', // Center the text vertically
      alignItems: 'center', // Center the text horizontally
      borderRadius: 10, // Rounded corners (optional)
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      backgroundColor: '#FF0000',
      fontWeight: 'bold',
      textAlign: 'center',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
  });


export default PhotoDelete;

