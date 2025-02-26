import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons'; // Import icons for the Plus Button
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';


const GOOGLE_API_KEY = 'AIzaSyCq3HQzTtwozhVSJk-ZoEbThI7XbUljyBA'; // Replace with your real API key
const API_URL = "http://{replace with your IP Address}:8000/api/location/"; // Change this if deployed (replace first part with your real IP)
const BASE_API_URL = "http://{replace with your IP Address}:8000/api/"; // change this if reployed (replace first part with your real IP)
const BASE_URL = "http://{replace with your IP Address}:8000/"; // replace first part with your real IP


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
      console.log("Fetched Data:", data);
  
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
      console.log("Updating map after fetching locations...");
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
    console.log("Marker Pressed: ", location);
    if (selectedLocation?.LocationId !== location.LocationId) {
      setSelectedLocation(location);
    }
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
  
      const response = await fetch(`${API_URL}${locationId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error(`Failed to delete location: ${response.status}`);
      }
  
      setLocations(prevLocations => prevLocations.filter(loc => loc.LocationId !== locationId));
      console.log("Location Successfully Deleted: " + response);
    } catch (error) {
      console.error("Delete Error:", error);
      setError(error.message);
    } finally {
      setIsDeleting(false); // Allow interactions again
    }
  };
  
  

  // function to schedule the photoshoots
  const schedulePhotoshoot = async (location) => {
    console.log("schedulePhotoshoot function is hit");
  
    if (!location || !location.LocationId) {
      alert("Please select a saved location to schedule a photoshoot.");
      return;
    }
  
    console.log("Selected Location:", location);
  
    const date = prompt("Enter date for photoshoot (YYYY-MM-DD):");
    if (!date) return;
  
    const formattedDate = `${date}T00:00:00Z`; // Ensure proper datetime format
  
    const requestData = {
      Date: formattedDate,
      LocationId: location.LocationId, // Ensure we're using a valid existing location
    };
  
    console.log("Sending POST request to:", `${API_URL}/photoshoots/create/`);
    console.log("Request Data:", requestData);
  
    try {
      const response = await axios.post(`${API_URL}/photoshoots/create/`, requestData, {
        headers: { "Content-Type": "application/json" },
      });
  
      console.log("Response Data:", response.data);
      alert("Photoshoot scheduled successfully!");
    } catch (error) {
      console.error("Error scheduling photoshoot:", error);
  
      if (error.response) {
        console.error("Error Response Data:", error.response.data);
        console.error("Error Response Status:", error.response.status);
      }
  
      alert("Failed to schedule photoshoot.");
    }
  };
  

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
      <View style={styles.container}>
        {/* Main Content */}
        <View style={styles.content}>
        {/* Conditionally render title based on showTitle */}
        {showTitle && (
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">View and Submit Photoshoot Locations📍</ThemedText>
          </ThemedView>
        )}

        {/* Show Input Bar Only When "Plus" Button is Clicked and Location hasn't been found */}
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
        <MapView style={styles.map} region={region}>
          
          {/* User selected location marker */}
          {marker && <Marker coordinate={marker} title="Selected Location" />}
        
          {/* Saved Locations - Green Markers */}
          {locations.map((location) =>
            location.latitude && location.longitude ? (
              <Marker
                key={`${location.latitude}-${location.longitude}`}
                coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                title={location.location_name || "Saved Location"}
                onPress={() => handleMarkerPress(location)} // Use optimized handler
                pinColor="green"
              />
            ) : null
          )}
        </MapView>

        

        {/* Show Schedule Photoshoot Button When a Location is Selected */}
        {selectedLocation && (
          <View style={{ position: "absolute", bottom: 20, alignSelf: "center" }}>
            <Button
              title="Schedule Photoshoot"
              onPress={() => {
                schedulePhotoshoot(selectedLocation); // Call function
                setSelectedLocation(null); // Reset after scheduling
              }}
              color="blue"
            />
          </View>
        )}
  
        {/* Show Add Location or Cancel button when location is found */}
        {isLocationFound && (
          <View style={styles.buttonContainer}>
            <Button
              title="Add Location?"
              onPress={addLocation}
              color="#28a745" // Green button for adding location
            />

          </View>
        )}

        {/* Delete Location Physically after selecting a green marker*/}
        {selectedLocation && locations.some(loc => loc.LocationId === selectedLocation.LocationId) && (
          <View style={styles.deleteButtonContainer}>
            <ThemedText style={styles.deleteButtonText}>{selectedLocation.location_name}</ThemedText>
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => deleteLocation(selectedLocation.LocationId)}
              disabled={isDeleting} // Disable delete button while deleting
            >
              <ThemedText style={styles.deleteButtonText}>Delete</ThemedText>
            </TouchableOpacity>
          </View>
        )}


        {/* Floating Schedule Photoshoot Button */}
        <TouchableOpacity 
          style={styles.scheduleButton} 
          onPress={() => {
            if (selectedLocation) {
              schedulePhotoshoot(selectedLocation);
              setSelectedLocation(null); // Reset after scheduling
            } else {
              Alert.alert("No Location Selected", "Please tap on a green marker to choose a location.");
            }
          }}
        >
          <Ionicons name="calendar" size={30} color="white" />
        </TouchableOpacity>

        <Button title="Schedule Photoshoot" onPress={schedulePhotoshoot} />

        {/* Floating + Button */}
        {!showInput && !isLocationFound && (
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => setShowInput(true)} // Show the input field
          >
            <Ionicons name="add" size={30} color="white" />
          </TouchableOpacity>
        )}

        {/* New Floating "X" Button (Closes Input UI) */}
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
  );
};

export default LocationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 500,
    marginTop: 10,
  },
  content: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    paddingBottom: 90,
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
  map: {
    width: '100%',
    height: '80%',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  addButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: '#007AFF', // Modern blue color
    width: 50,
    height: 50,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Shadow for Android
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
  },
  cancelButton: {
    position: 'absolute',
    bottom: 90, // Same as the blue button
    right: 20, // Shift left so it's next to the blue button
    backgroundColor: '#dc3545', // Red color
    width: 50,
    height: 50,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Shadow for Android
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
  },
  scheduleButton: {
    position: 'absolute',
    bottom: 150, // Slightly above the blue add button
    right: 20,
    backgroundColor: '#FFC107', // Yellow for contrast
    width: 50,
    height: 50,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Shadow for Android
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
  },
  deleteButtonContainer: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
});