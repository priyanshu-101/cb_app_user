import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

const EmployeesScreen = () => {
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const route = useRoute();
  const { employeeUsername } = route.params;  // Use employeeUsername

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/Employee/${employeeUsername}`); // Use employeeUsername in the API call
        setEmployeeData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching employee data:', error);
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [employeeUsername]); // Dependency on employeeUsername

  const handleBackPress = () => {
    navigation.navigate('Profile', { employeeUsername }); // Pass employeeUsername
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Icon name="arrow-back" type="material" color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Profile</Text>
      </View>
      {employeeData && (
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?cs=srgb&dl=pexels-simon-robben-55958-614810.jpg&fm=jpg' }} 
            style={styles.profileImage}
          />
          <Text style={styles.nameText}>{employeeData.employee_name}</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>{employeeData.employee_address}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mobile:</Text>
              <Text style={styles.infoValue}>{employeeData.mobile_no}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>DOB:</Text>
              <Text style={styles.infoValue}>{employeeData.date_of_birth}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{employeeData.email_address}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Password:</Text>
              <Text style={styles.infoValue}>{employeeData.password}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Designation:</Text>
              <Text style={styles.infoValue}>{employeeData.designation}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Salary:</Text>
              <Text style={styles.infoValue}>{`${employeeData.currency_symbol}${employeeData.current_salary}`}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Working Hours:</Text>
              <Text style={styles.infoValue}>{`${employeeData.working_hours_from} - ${employeeData.working_hours_to}`}</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#68689E', 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center', // Center the text
    flex: 1, // Make the text take up the remaining space
  },
  profileContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 10,
    shadowColor: '#000', // Shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5, // Android shadow effect
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoGrid: {
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
  },
  menuIcon: {
    padding: 5,
    position: 'absolute',
    right: 10,
    top: 10,
  },
  menu: {
    backgroundColor: 'white',
    position: 'absolute',
    right: 10,
    top: 120,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  menuItem: {
    padding: 10,
    fontSize: 16,
  },
});

export default EmployeesScreen;
