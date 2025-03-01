import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, TouchableOpacity, Alert, Animated, Text, FlatList, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons'; // Import icons for the Plus Button
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { format } from 'date-fns';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import * as Notifications from 'expo-notifications';


const GOOGLE_API_KEY = 'AIzaSyCq3HQzTtwozhVSJk-ZoEbThI7XbUljyBA'; // Replace with your real API key
const API_URL = "http://{replace with your IP}:8000/api/location/"; // Change this if deployed (replace first part with your real IP)
const BASE_API_URL = "http://{replace with your IP}:8000/api/"; // change this if reployed (replace first part with your real IP)
const BASE_URL = "http://{replace with your IP}:8000/"; // replace first part with your real IP


// type data for the Locations model
type Location = {
  LocationId: number;
  location_name: string;
  Address: string;
  latitude: number;
  longitude: number;
};

// type data for the Photoshoots Model
interface Photoshoot {
  PhotoshootId: number;
  LocationId: number; 
  Date: string;
}

const LocationScreen = () => {

  const [locations, setLocations] = useState<Location[]>([]);
  const [address, setAddress] = useState(''); // keeps track of state when fetching Location data. 
  const [error, setError] = useState<string | null>(null); // keeps track of state of errors
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);  // New state for pull-to-refresh


  const [region, setRegion] = useState({
    latitude: 0,  // Centered on the world
    longitude: 0,
    latitudeDelta: 100, // Zoomed out to show continents
    longitudeDelta: 100,
  });

  const [marker, setMarker] = useState(null);
  const [showInput, setShowInput] = useState(false); // Controls visibility of input
  const [isLocationFound, setIsLocationFound] = useState(false); // Track if location is found
  const [showTitle, setShowTitle] = useState(true);  // State for managing title visibility
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null); // Store selected location
  const [showConfirm, setShowConfirm] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);
  const [date, setDate] = useState(''); // controls the state of the date input for photoshoot scheduling
  const [isDateInputEnabled, setIsDateInputEnabled] = useState(false); // Control the date input field
  const [photoshoots, setPhotoshoots] = useState<Photoshoot[]>([]); // manages state of photoshoots
  const [isAddButtonVisible, setIsAddButtonVisible] = useState(true); // Initially, the Add button is visible


  const slideAnim = useState(new Animated.Value(100))[0]; // Animated value for bottom position

    // handles the post notifications for the photoshoot scheduling
    useEffect(() => {
      async function registerForPushNotificationsAsync() {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          alert('Permission for notifications was denied.');
          return;
        }
    
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
          }),
        });
      }
    
      registerForPushNotificationsAsync();
    }, []);

  useEffect(() => {
    if (selectedLocation) {
      // Animate button to pop up from the bottom when a location is selected
      setButtonVisible(true);
      Animated.spring(slideAnim, {
        toValue: 0, // Move button into view
        useNativeDriver: true,
      }).start();
    } else {
      // Animate button out of view when no location is selected
      Animated.spring(slideAnim, {
        toValue: 100, // Hide the button
        useNativeDriver: true,
      }).start(() => setButtonVisible(false)); // Optionally reset visibility after animation
    }
  }, [selectedLocation]);


  // function to fetch stored Locations
  const fetchLocation = async () => {
    console.log("Fetching location...");
    setLoading(true);
    try {
      console.log("Fetching from: ", API_URL);
      const response = await fetch(API_URL);
      console.log("Response Status:", response.status);
  
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
  
      const data: Location[] = await response.json();
  
      if (data.length === 0) {
        console.warn("No locations returned from API.");
      }
  
      const validLocations = data.map(location => ({
        ...location,
        LocationName: location.location_name || 'No LocationName',
      }));
  
      setLocations(validLocations);
      setDataLoaded(prev => !prev);  // 🔥 Ensures UI re-renders
    } catch (err: any) {
      console.error("Fetch Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  

  // Fetch locations on mount
  useEffect(() => {
    fetchLocation();
  }, []); // Runs only once when the component mounts

  // Update the UI when locations change
  useEffect(() => {
    if (locations.length > 0) {
      setDataLoaded(prev => !prev); // Forces UI update
    }
  }, [locations]); // Runs when `locations` updates
  

  // function to fetch from the Google GeoCoding API to convert Addresses into Longitude and Latitude
  const fetchAndPostCoordinates = async () => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`
      );

      if (response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        const locationName = response.data.results[0].formatted_address; // Get location name

        setRegion({
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });

        setMarker({ latitude: location.lat, longitude: location.lng });
        setIsLocationFound(true); // Set to true when location is found
        setSelectedLocation(null); // means location is supposed to disappear when the find location is toggled
      } else {
        alert("Address not found");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to fetch location");
    }
    setShowTitle(false); // Hides the title once the location is found
  };

  // function to handle the marker press
  const handleMarkerPress = (location: Location) => {
    setSelectedLocation({ ...location }); // Spread to ensure a new object reference
    setIsDateInputEnabled(true); // Enable the date input once a location is selected
    setShowTitle(false); // Hide the title when selecting a green marker
    setIsAddButtonVisible(false); // Hide the Add button when a green marker is clicked

    // call photoshoots upon clicking
  fetchPhotoshoots(location.LocationId); // Assuming location has an `id` property
  };
   
  
  // Function to POST/CREATE a brand new Location into Location DB
  const addLocation = async () => {
    try {
      const locationName = address; // Use the address for location name
      await axios.post(`${BASE_URL}/api/location/create/`, 
        {
          address: address,
          latitude: marker.latitude,
          longitude: marker.longitude,
          location_name: locationName, 
        },
        { 
          headers: { 
            "Content-Type": "application/json" 
          },
        }
      );
      alert("Location saved successfully!");
      setIsLocationFound(true); // Set state to show the "Add Location" button
      setAddress(''); // Clear the address field
      //setShowTitle(true); // shows the title after the show the 
      fetchLocation(); // fetches the location to update the Map after. 
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save location");
    } finally {
      setLoading(false);
    }
  };

  // function to delete location 
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteLocation = async (locationId: number) => {
    try {
      setIsDeleting(true); // Prevent interactions
      setSelectedLocation(null); // Immediately clear selection UI

      // Find the location you're going to delete
      const locationToDelete = locations.find(loc => loc.LocationId === locationId);
    
      if (!locationToDelete) {
        throw new Error("Location not found");
      }
  
      const response = await fetch(`${API_URL}${locationId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error(`Failed to delete location: ${response.status}`);
      }
  
      // removes location from the state
      setLocations(prevLocations => prevLocations.filter(loc => loc.LocationId !== locationId));

      // Show location name in the alert
      alert(`Location Successfully Deleted: ${locationToDelete.location_name}`);

      setShowTitle(true); // shows the head title again after you delete the location
      setIsAddButtonVisible(true); // shows the add button again after location deletion 
    } catch (error) {
      console.error("Delete Error:", error);
      setError(error.message);
    } finally {
      setIsDeleting(false); // Allow interactions again
    }
  };

  // function to bring the alert for the warning message before deleting a photoshoot
  // at the specific location
  const handleDeleteConfirmation = (photoshootId: number) => {
    Alert.alert(
        "Delete Photoshoot",
        "Are you sure you want to delete this photoshoot?",
        [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Delete", 
                onPress: () => deletePhotoshoot(photoshootId),
                style: "destructive"
            }
        ]
    );
};


  // function to delete Photoshoots at Specific Locations
  const deletePhotoshoot = async (photoshootId: number) => {
    try {
        const response = await fetch(`${BASE_API_URL}photoshoots/${photoshootId}/`, { 
            method: 'DELETE',
        });

        if (!response.ok) {
            console.error("Error deleting photoshoot:", await response.json());
            return;
        }

        Alert.alert("Deleted", "Photoshoot has been removed successfully.");
        
        // Remove the deleted photoshoot from state
        setPhotoshoots((prev) => prev.filter(photo => photo.id !== photoshootId));

        // Check if selectedLocation is not null before calling fetchPhotoshoots
        if (selectedLocation) {
            fetchPhotoshoots(selectedLocation.LocationId);  // Re-fetch the photoshoots
        } else {
            console.error("Selected location is null, cannot fetch photoshoots.");
        }
    } catch (error) {
        console.error("Error deleting photoshoot:", error);
    }
};



  // function to schedule the photoshoots
  const schedulePhotoshoot = async (location: Location) => {
    console.log("schedulePhotoshoot function is hit");
  
    if (!location || !location.LocationId) {
      alert("Please select a saved location to schedule a photoshoot.");
      console.error("Error: location or LocationId is missing", location);
      return;
    }
  
    if (!date) {
      alert("Please enter a date for the photoshoot.");
      console.error("Error: Date is missing.");
      return;
    }
  
    // Convert input date to local time
    const localDateTime = new Date(date);
    console.log("Local Date & Time:", localDateTime.toLocaleString()); // Logs local time
  
    // Convert to ISO format for API
    const formattedDate = localDateTime.toISOString();
    console.log("Formatted Date (UTC ISO):", formattedDate);
  
    const requestData = {
      Date: formattedDate,
      LocationId: location.LocationId,
    };
  
    console.log("Sending request with:", requestData);
  
    try {
      const response = await axios.post(
        `${BASE_API_URL}photoshoots/create/`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      console.log("Response Data:", response.data);
      alert("Photoshoot scheduled successfully!");
      setIsDateInputEnabled(false);
      setDate('');
  
      if (selectedLocation) {
        fetchPhotoshoots(selectedLocation.LocationId);
      } else {
        console.error("Selected location is null, cannot fetch photoshoots.");
      }
  
      // Schedule local push notification for the photoshoot
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "📷 Photoshoot Reminder!",
          body: `You have a photoshoot scheduled today at ${location.location_name}.`,
          sound: "default",
        },
        trigger: {
          date: localDateTime, // Triggers at the scheduled date & time
        },
      });
  
      console.log("Push notification scheduled for:", localDateTime.toLocaleString());
  
    } catch (error) {
      console.error("Error scheduling photoshoot:", error);
      if (error.response) {
        console.error("Error Response Data:", error.response.data);
        console.error("Error Response Status:", error.response.status);
      }
      alert("Failed to schedule photoshoot.");
    }
  };
  

    // fetches the photoshoots 
    const fetchPhotoshoots = async (locationId: number) => {
      try {
        const response = await fetch(`${BASE_API_URL}photoshoots?locationId=${locationId}`);
        console.log("URL: ", `${BASE_API_URL}photoshoots?locationId=${locationId}`);  // Log the URL
    
        if (!response.ok) {
          console.error("Network response was not ok", response);
          return;
        }
    
        const data = await response.json();
        console.log("Fetched Photoshoots data:", data);  // Log the response data
    
        if (Array.isArray(data)) {
          setPhotoshoots([...data]); // Spread operator forces re-render
        } else {
          console.error("Fetched data is not an array:", data);
        }
      } catch (error) {
        console.error('Error fetching photoshoots:', error);
      } finally {
        setLoading(false);
      }
    };
    

  // function to handle cancelling the action of adding a location 
  const cancelAction = () => {
    setShowInput(false);
    setAddress('');
    setIsLocationFound(false);
    setRegion({
      latitude: 0,
      longitude: 0,
      latitudeDelta: 100,
      longitudeDelta: 100,
    });
    setMarker(null);
    setShowTitle(true); // Show title again when cancel button is pressed
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <View style={styles.container}>
        {/* Main Content */}
        <View style={styles.content}>
            {/* Conditionally render title */}
            {showTitle && (
                <ThemedView style={styles.titleContainer}>
                    <ThemedText type="title">View and Submit Photoshoot Locations📍</ThemedText>
                </ThemedView>
            )}

            {/* Show Input Bar Only When "Plus" Button is Clicked */}
            {showInput && !isLocationFound && (
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter address (Include City, State, and Zipcode)"
                        value={address}
                        onChangeText={setAddress}
                    />
                    <Button title="Find Location" onPress={fetchAndPostCoordinates} />
                </View>
            )}

            {/* Map View */}
            <MapView
                style={styles.map}
                region={region}
                onPress={(e) => {
                    if (e.nativeEvent.action === "marker-press") return;
                    setSelectedLocation(null);
                    setIsAddButtonVisible(true); // Show the Add button again
                    setShowTitle(true); // shwos the title again 
                }}
            >
                {/* User-selected location marker */}
                {marker && <Marker coordinate={marker} title="Selected Location" />}

                {/* Saved Locations - Green Markers */}
                {locations.map((location) =>
                    location.latitude && location.longitude ? (
                        <Marker
                            key={`${location.latitude}-${location.longitude}`}
                            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                            title={location.location_name}
                            onPress={() => handleMarkerPress(location)}
                            pinColor="green"
                        />
                    ) : null
                )}
            </MapView>

            {/* Add Location or Cancel button when location is found */}
            {isLocationFound && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.addLocationButton} onPress={addLocation}>
                  <Text style={styles.addLocationButtonText}>Add Location?</Text>
                </TouchableOpacity>
              </View>
            )}


            {/* Photoshoots List - Appears Below the Selected Green Marker */}
            {selectedLocation && (
              <View style={styles.photoshootContainer}>
                <Text style={styles.photoshootTitle}>📸 {selectedLocation.location_name} - Photoshoots:</Text>
                
                {loading ? (
                  <ActivityIndicator size="large" color="#FFC107" />
                ) : (
                  <>
                    {/* If there are no photoshoots, display a message */}
                    {photoshoots.length === 0 ? (
                      <Text style={styles.noPhotoshootsMessage}>No photoshoots available at this location.</Text>
                    ) : (
                      <FlatList
                        data={photoshoots}
                        keyExtractor={(item) => item.PhotoshootId.toString()}
                        renderItem={({ item }) => {
                          if (!item.Date) {
                            console.error("Invalid date value:", item);
                            return null;
                          }
                          try {
                            const utcDate = new Date(item.Date);
                            const formattedDate = utcDate.toISOString().split('T')[0]; // Get YYYY-MM-DD

                            const formattedLocaleDate = new Intl.DateTimeFormat('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric', 
                              timeZone: 'UTC'  // Prevents shifting to local time
                            }).format(new Date(formattedDate));

                            return (
                              <Swipeable
                                renderRightActions={() => (
                                  <TouchableOpacity 
                                    style={styles.deletePhotoshootButton}
                                    onPress={() => handleDeleteConfirmation(item.PhotoshootId)}
                                  />
                                )}
                              >
                                <TouchableOpacity 
                                  onPress={() => fetchPhotoshoots(selectedLocation.LocationId)}
                                  style={styles.photoshootItem}
                                >
                                  <Text style={styles.photoshootDate}>
                                    📅 {formattedLocaleDate} {/* Displays March 1, 2025 */}
                                  </Text>
                                  <Text 
                                    style={styles.deleteButtonText} 
                                    onPress={() => handleDeleteConfirmation(item.PhotoshootId)}
                                  >
                                    Delete
                                  </Text>
                                </TouchableOpacity>
                              </Swipeable>
                            );
                          } catch (error) {
                            console.error("Error parsing date:", item.Date, error);
                            return null;
                          }
                        }}
                      />
                    )}
                  </>
                )}
              </View>
            )}


            {/* Delete Location Button - Only When Selecting a Green Marker */}
            {selectedLocation && locations.some(loc => loc.LocationId === selectedLocation.LocationId) && (
                <View style={styles.deleteButtonContainer}>
                    <TouchableOpacity 
                        style={styles.deleteButton} 
                        onPress={() => deleteLocation(selectedLocation.LocationId)}
                        disabled={isDeleting}
                    >
                        <ThemedText style={styles.deleteButtonText}>Delete {selectedLocation.location_name}?</ThemedText>
                    </TouchableOpacity>
                </View>
            )}

            {/* Date Input & Schedule Photoshoot Button */}
            {isDateInputEnabled && selectedLocation && (
                <View style={styles.dateInputContainer}>
                    <TextInput
                        style={styles.photoshootDateInput}
                        placeholder="Enter Date for Photoshoot (YYYY-MM-DD)"
                        value={date}
                        onChangeText={setDate}
                        keyboardType="default"
                        placeholderTextColor="#bbb"
                    />
                    <Button title="Book Photoshoot?" onPress={() => schedulePhotoshoot(selectedLocation)} color="#FFC107" />
                </View>
            )}

            {/* Floating + Button for Adding Location */}
            {isAddButtonVisible && !showInput && !isLocationFound && (
                <TouchableOpacity 
                    style={styles.addButton} 
                    onPress={() => setShowInput(true)}
                >
                    <Ionicons name="add" size={30} color="white" />
                </TouchableOpacity>
            )}

            {/* Floating X Button to Close Input */}
            {showInput && (
                <TouchableOpacity 
                    style={styles.cancelButton} 
                    onPress={cancelAction}
                >
                    <Ionicons name="close" size={30} color="white" />
                </TouchableOpacity>
            )}
        </View>
    </View>
    </GestureHandlerRootView>
  );
};

export default LocationScreen;

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: "#f5f5f5",
  },
  content: {
      flex: 1,
      padding: 10,
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    paddingTop: 15,
    paddingBottom: 15,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  inputContainer: {
    backgroundColor: '#222', // Dark background for modern feel
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius: 5,
    color: 'white',
  },
  map: {
      flex: 1,
      borderRadius: 10,
      overflow: "hidden",
  },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      position: 'absolute', // Use absolute positioning
      top: 50, // Position the button 50 units from the top
      left: 0,
      right: 0,
      paddingHorizontal: 20, // Adjust the padding as needed
      zIndex: 10, // Ensure the button is above other content
    },
    addLocationButton: {
      backgroundColor: '#28a745', // Green color
      paddingVertical: 12, // Vertical padding
      paddingHorizontal: 20, // Horizontal padding
      borderRadius: 5, // Rounded corners
      alignItems: 'center', // Center content horizontally
      justifyContent: 'center', // Center content vertically
      width: '100%', // Button takes full width within container
      elevation: 3, // Add shadow effect for Android
      shadowColor: '#000', // Shadow color for iOS
      shadowOffset: { width: 0, height: 2 }, // Shadow offset
      shadowOpacity: 0.2, // Shadow opacity for iOS
      shadowRadius: 2, // Shadow radius for iOS
    },
    addLocationButtonText: {
      color: 'white', // Text color
      fontSize: 16, // Text size
      fontWeight: 'bold', // Make the text bold
      textAlign: 'center', // Center the text
    },
  photoshootContainer: {
      backgroundColor: "white",
      padding: 10,
      marginTop: 5,
      borderRadius: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
      marginBottom: 45, // space in between the delete button
  },
  photoshootTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 5,
  },
  photoshootItem: {
      flexDirection: 'row',  // This will align children (date and delete button) horizontally
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#ccc",
  },
  photoshootDate: {
      fontSize: 18,
      color: "#333",
      flex: 1,  // This makes sure the date takes up available space and moves the delete button to the right
      marginRight: 65,  // Adds some spacing between the date and the delete button
  },
  deleteButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10, // You can reduce this to move it closer to the Photoshoots container
    padding: 15,
    backgroundColor: "#dc3545",
    borderRadius: 5,
    marginBottom: 25, // Add a margin to the bottom to give space between the Delete button and the next element
    bottom: 45, // Move to the top of the screen
},
  deletePhotoshootButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 65, 
    height: '100%', 
    position: 'absolute',
  },
  deleteButtonText: {
      color: "white",
      fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    borderRadius: 50,
},
    /* Date Input Positioned Near Bottom */
    dateInputContainer: {
      position: 'absolute',
      justifyContent: 'center',
      top: 30, // Move to the top of the screen
      left: 10,
      right: 0,
      width: '100%',
      backgroundColor: '#2a2a2a', // Dark modern background
      padding: 10,
      elevation: 5, // Shadow effect
      shadowColor: '#000',
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 3 },
      borderRadius: 15,
      zIndex: 10, // Ensure it's on top of other elements
    },
    
  photoshootDateInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: "#ccc",
      padding: 10,
      borderRadius: 5,
      backgroundColor: "#fff",
      marginRight: 10,
      left: 5,
      fontSize: 12
  },
  addButton: {
      position: "absolute",
      bottom: 90,
      right: 20,
      backgroundColor: "#1591EA",
      padding: 15,
      borderRadius: 30,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5,
  },
  cancelButton: {
      position: "absolute",
      bottom: 90,
      left: 20,
      backgroundColor: "#dc3545",
      padding: 15,
      borderRadius: 30,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5,
  },
  noPhotoshootsMessage: {
    color: 'gray',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  
});
