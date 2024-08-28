import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons'; // Make sure to install @expo/vector-icons
import { useNavigation,useRoute } from '@react-navigation/native';

const App = () => {
  const [checkedIn, setCheckedIn] = useState(true);
  const [checkedOut, setCheckedOut] = useState(true);
  const [isLate, setIsLate] = useState(true);
  const [leavingEarly, setLeavingEarly] = useState(true);
  const route = useRoute();
  const { employeeId } = route.params;

  const navigation = useNavigation(); // Use navigation hook to navigate

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile',{employeeId})} style={styles.arrow}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Add Employee</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.contentSpacing}>
            <View style={styles.row}>
              <Text style={styles.label}>Check In</Text>
              <View style={styles.circle}>
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Check Out</Text>
              <View style={styles.circleRed}>
                <Ionicons name="close" size={16} color="white" />
              </View>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>You Are Late</Text>
              <View style={styles.square}>
                <MaterialIcons name="check-box" size={24} color="black" />
              </View>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Leaving Early</Text>
              <View style={styles.square}>
                <MaterialIcons name="check-box" size={24} color="black" />
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Leave Application</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#68689E',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
    position: 'relative',
  },
  arrow: {
    position: 'absolute',
    left: 20,
  },
  headerText: {
    fontSize: 24, // Increased font size
    fontWeight: 'bold',
    color: 'white',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    flex: 1,
    justifyContent: 'center',
  },
  contentSpacing: {
    flex: 1,
    justifyContent: 'space-between', // Adjusted to reduce space
    marginBottom: 50,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 60, // Reduced space between rows
  },
  label: {
    fontSize: 22, // Increased font size
    marginBottom: 5,
    marginTop: 5,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleRed: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  square: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 22, // Increased font size
  },
});

export default App;
