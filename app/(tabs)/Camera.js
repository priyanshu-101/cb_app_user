import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, Image, StyleSheet, PermissionsAndroid, Platform, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

const AttendancePage = () => {
  const [photoUri, setPhotoUri] = useState(null);
  const [dateTime, setDateTime] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [city, setCity] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [customCityVisible, setCustomCityVisible] = useState(false);
  const [customCity, setCustomCity] = useState('');
  const [name, setName] = useState(''); // Employee name state
  const [sites, setSites] = useState([]);
  const videoRef = useRef(null);
  const route = useRoute();
  const { employeeId } = route.params;
  const navigation = useNavigation();

  useEffect(() => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
        .then(granted => {
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Location permission not granted');
          }
        })
        .catch(error => console.error('Error requesting location permission:', error));
    }
  }, []);

  useEffect(() => {
    // Fetch sites data from the server
    axios.get(`http://localhost:3000/Camera/${employeeId}`)
      .then(response => {
        setSites(response.data);
      })
      .catch(error => console.error('Error fetching sites:', error));
  }, []);

  useEffect(() => {
    // Fetch employee data from the server
    axios.get(`http://localhost:3000/employee/${employeeId}`)
      .then(response => {
        setName(response.data.employee_name);
      })
      .catch(error => console.error('Error fetching employee name:', error));
  }, [employeeId]);

  const handleMarkAttendance = () => {
    setShowDropdown(true);
  };

  const handleCitySelect = (selectedCity) => {
    if (selectedCity === 'Other') {
      setCustomCityVisible(true);
      setCity(null);
    } else {
      setCity(selectedCity);
      setCustomCityVisible(false);
      setShowDropdown(false);
      setCameraActive(true);
      startCamera();
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const handleCaptureImage = async () => {
    try {
      if (!videoRef.current) {
        console.error('Video reference is not available');
        return;
      }

      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const uri = canvas.toDataURL('image/jpeg');
      setPhotoUri(uri);
      setCameraActive(false);

      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());

      setDateTime(new Date().toLocaleString());
    } catch (error) {
      console.error('Error capturing photo:', error);
    }
  };

  const storeAttendanceData = async (imageData) => {
    try {
      const attendanceData = {
        employee_name: name,
        employee_photo: imageData,
        attendance_date: new Date().toISOString().split('T')[0],
        attendance_time: new Date().toTimeString().split(' ')[0],
        city: city || customCity,
      };

      await axios.post(`http://localhost:3000/Camera/${employeeId}`, attendanceData);
      alert('Attendance marked successfully!');
    } catch (error) {
      console.error('Error storing attendance data:', error);
      alert('Failed to mark attendance.');
    }
  };

  useEffect(() => {
    if (photoUri) {
      storeAttendanceData(photoUri);
    }
  }, [photoUri]);

  const handleBack = () => {
    navigation.navigate('Profile', { employeeId });
  };

  return (
    <View style={styles.container}>
      {!cameraActive && !photoUri && (
        <>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your name"
              value={name} // Auto-fill name
              onChangeText={setName}
              editable={false} // Make it read-only
            />
          </View>
          <View style={styles.buttonContainer}>
            <Button title="Mark Attendance" onPress={handleMarkAttendance} />
          </View>
        </>
      )}

      {showDropdown && (
        <View style={styles.dropdownContainer}>
          <ScrollView style={styles.dropdown}>
            {sites.map(site => (
              <TouchableOpacity
                key={site.id}
                style={styles.dropdownItem}
                onPress={() => handleCitySelect(site.name)}
              >
                <Text style={styles.dropdownItemText}>{site.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => handleCitySelect('Other')}
            >
              <Text style={styles.dropdownItemText}>Other</Text>
            </TouchableOpacity>
          </ScrollView>

          {customCityVisible && (
            <View style={styles.customCityContainer}>
              <TextInput
                style={styles.customCityInput}
                placeholder="Enter your site"
                value={customCity}
                onChangeText={setCustomCity}
                onSubmitEditing={() => {
                  setCity(customCity);
                  setShowDropdown(false);
                  setCameraActive(true);
                  startCamera();
                }}
              />
            </View>
          )}
        </View>
      )}

      {cameraActive && (
        <View style={styles.cameraContainer}>
          <Text style={styles.cityText}>Site: {city || customCity}</Text>
          <video ref={videoRef} style={styles.video} autoPlay />
          <TouchableOpacity style={styles.captureButton} onPress={handleCaptureImage}>
            <Text style={styles.captureButtonText}>Capture Image</Text>
          </TouchableOpacity>
        </View>
      )}

      {photoUri && (
        <View style={styles.photoContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← Back to Profile</Text>
          </TouchableOpacity>
          <Image source={{ uri: photoUri }} style={styles.photo} />
          <Text style={styles.dateTime}>Date and Time: {dateTime}</Text>
          {city && <Text style={styles.city}>Site: {city}</Text>}
          <Text style={styles.name}>Name: {name}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  inputContainer: {
    marginBottom: 20,
    width: '80%',
  },
  textInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  cameraContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  captureButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  photoContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  photo: {
    width: 300,
    height: 300,
    borderRadius: 10,
  },
  dateTime: {
    marginTop: 10,
    fontSize: 16,
  },
  city: {
    marginTop: 10,
    fontSize: 16,
  },
  name: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cityText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  video: {
    width: 320,
    height: 240,
    borderRadius: 10,
    backgroundColor: '#000',
  },
  dropdownContainer: {
    position: 'absolute',
    top: 100,
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  dropdown: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 16,
  },
  customCityContainer: {
    padding: 10,
  },
  customCityInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  backButton: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default AttendancePage;
