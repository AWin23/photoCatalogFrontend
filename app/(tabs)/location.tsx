import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons'; // Import icons for the Plus Button
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';


const GOOGLE_API_KEY = 'AIzaSyCq3HQzTtwozhVSJk-ZoEbThI7XbUljyBA'; // Replace with your real API key
const API_URL = "http://{replace with your IP}:8000/api/location/"; // Change this if deployed
const BASE_API_URL = "http://{replace with your IP}:8000/api/"; // change this if reployed


// type data for the Locations model
type Location = {
  LocationId: number;
  LocationName: string;
  Address: string;
  latitude: number;
  longitude: number;
};

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

  // function to fetch stored Locations
  const fetchLocation = async () => {
    setLoading(true); // Ensures that loading is true when fetching new Locations data
    try {
      console.log("Fetching from: ", API_URL);
      const response = await fetch(API_URL); // awaits the fetched data from the URL
      console.log("Response Status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const data: Location[] = await response.json();
      console.log("Fetched Data:", data);

      // Ensures that Location array has valid objects, and handle null or undefined values
      const validLocation = data.map(location => ({
        ...location,
        LocationName: location.LocationName || 'No LocationName',
      })) 

      setLocations(validLocation); // sets the processsed data
     } catch (err: any) {
      console.error("Fetch Error:", err);
      setError(err.message);
     } finally {
      setRefreshing(false);
     }

  }

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
  const handleMarkerPress = async (locationId: number) => {
    try {

      // Ensure no trailing slash before the endpoint
      const cleanUrl = `${BASE_API_URL}photoshoots?locationID=${locationId}`;
      
      const response = await axios.get(cleanUrl);
    
      if (response.data.length === 0) {
        alert("No photoshoots found at this location.");
      } else {
        console.log("Photoshoots:", response.data);
        alert(`Photoshoots scheduled here:\n${response.data.map(p => `• ${p.Date}`).join("\n")}`);
      }
    } catch (error) {
      console.error("Error fetching photoshoots:", error);
      alert("Failed to fetch photoshoots.");
    }
  };
  

  // Function to POST/CREATE a brand new Location into Location DB
  const addLocation = async () => {
    try {
      const locationName = address; // Use the address for location name
      await axios.post("http://{replace with your IP}:8000/api/location/create/", 
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

  // function to schedule the photoshoots
  const schedulePhotoshoot = async () => {
    if (!marker) {
      alert("Please select a location first!");
      return;
    }
  
    const date = prompt("Enter date for photoshoot (YYYY-MM-DD):");
    if (!date) return;
  
    try {
      await axios.post(`${API_URL}/photoshoot/create/`, {
        Date: date,
      });
  
      alert("Photoshoot scheduled successfully!");
    } catch (error) {
      console.error("Error scheduling photoshoot:", error);
      alert("Failed to schedule photoshoot.");
    }
  };
  

  // Calls the fetchLocation inititally and on refresh
  useEffect(() => {
    fetchLocation();
  }, [])

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
                key={`${location.latitude}-${location.longitude}`} // Create a unique key from latitude and longitude
                coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                title={location.LocationName || "Saved Location"}
                onPress={() => handleMarkerPress(location.LocationId)}
                pinColor="green"
              />
            ) : null
          )}
        </MapView>
  
        {/* Show Add Location or Cancel button when location is found */}
        {isLocationFound && (
          <View style={styles.buttonContainer}>
            <Button
              title="Add Location?"
              onPress={addLocation}
              color="#28a745" // Green button for adding location
            />
            <Button
              title="Cancel"
              onPress={cancelAction}
              color="#dc3545" // Red button for canceling the action
            />
          </View>
        )}

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
});