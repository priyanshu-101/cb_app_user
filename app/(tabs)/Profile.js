import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Avatar } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

// Function to fetch employee data by username
const fetchEmployeeData = async (employeeUsername) => {
  try {
    const response = await axios.get(`http://localhost:3000/Profile/username/${employeeUsername}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching employee data:', error);
    return null;
  }
};

const Profile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { employeeUsername: initialUsername } = route.params;  // Get employeeUsername from route params

  const [employeeUsername, setEmployeeUsername] = useState(initialUsername);

  useEffect(() => {
    const getEmployeeData = async () => {
      const employeeData = await fetchEmployeeData(initialUsername);
      if (employeeData) {
        setEmployeeUsername(employeeData.employee_username);  // Set employee username from fetched data
      }
    };

    getEmployeeData();
  }, [initialUsername]);

  const handleLogoutNavigation = () => {
    navigation.navigate('Login');
  };

  const navigateToPage = (pageName, additionalParams = {}) => {
    const params = { employeeUsername, ...additionalParams };
    navigation.navigate(pageName, params);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Avatar
            rounded
            size="large"
            source={{ uri: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?cs=srgb&dl=pexels-simon-robben-55958-614810.jpg&fm=jpg' }}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.employeeUsername}>{employeeUsername.toUpperCase()}</Text>  {/* Display employee username */}
          </View>
        </View>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            onPress={handleLogoutNavigation}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <View style={styles.menuItem}>
          <Image style={styles.menuImage} source={{ uri: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?cs=srgb&dl=pexels-simon-robben-55958-614810.jpg&fm=jpg' }} />
          <TouchableOpacity style={styles.menuTouchable} onPress={() => navigateToPage('Employee')}>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Profile</Text>
              <Text style={styles.menuSubText}>Display your profile details</Text>
            </View>
            <View style={styles.triangle} />
          </TouchableOpacity>
        </View>

        <View style={styles.menuItem}>
          <Image style={styles.menuImage} source={{ uri: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?cs=srgb&dl=pexels-simon-robben-55958-614810.jpg&fm=jpg' }} />
          <TouchableOpacity style={styles.menuTouchable} onPress={() => navigateToPage('Camera')}>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Mark Attendance</Text>
              <Text style={styles.menuSubText}>Mark your daily attendance</Text>
            </View>
            <View style={styles.triangle} />
          </TouchableOpacity>
        </View>

        <View style={styles.menuItem}>
          <Image style={styles.menuImage} source={{ uri: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?cs=srgb&dl=pexels-simon-robben-55958-614810.jpg&fm=jpg' }} />
          <TouchableOpacity style={styles.menuTouchable} onPress={() => navigateToPage('ViewAtt')}>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>View Attendance</Text>
              <Text style={styles.menuSubText}>Check your monthly attendance in detail</Text>
            </View>
            <View style={styles.triangle} />
          </TouchableOpacity>
        </View>

        <View style={styles.menuItem}>
          <Image style={styles.menuImage} source={{ uri: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?cs=srgb&dl=pexels-simon-robben-55958-614810.jpg&fm=jpg' }} />
          <TouchableOpacity style={styles.menuTouchable} onPress={() => navigateToPage('Application')}>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Leave Application</Text>
              <Text style={styles.menuSubText}>Total leaves</Text>
            </View>
            <View style={styles.triangle} />
          </TouchableOpacity>
        </View>

        <View style={styles.menuItem}>
          <Image style={styles.menuImage} source={{ uri: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?cs=srgb&dl=pexels-simon-robben-55958-614810.jpg&fm=jpg' }} />
          <TouchableOpacity style={styles.menuTouchable} onPress={() => navigateToPage('Salary')}>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>View Salary</Text>
              <Text style={styles.menuSubText}>Check your income</Text>
            </View>
            <View style={styles.triangle} />
          </TouchableOpacity>
        </View>

        <View style={styles.menuItem}>
          <Image style={styles.menuImage} source={{ uri: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?cs=srgb&dl=pexels-simon-robben-55958-614810.jpg&fm=jpg' }} />
          <TouchableOpacity style={styles.menuTouchable} onPress={() => navigateToPage('HolidayList')}>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Public Holidays</Text>
              <Text style={styles.menuSubText}>Check allocated public holidays</Text>
            </View>
            <View style={styles.triangle} />
          </TouchableOpacity>
        </View>

        <View style={styles.menuItem}>
          <Image style={styles.menuImage} source={{ uri: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?cs=srgb&dl=pexels-simon-robben-55958-614810.jpg&fm=jpg' }} />
          <TouchableOpacity style={styles.menuTouchable} onPress={() => navigateToPage('Notice')}>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Notice</Text>
              <Text style={styles.menuSubText}>Notice by Admin</Text>
            </View>
            <View style={styles.triangle} />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#D9D9D9',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    marginLeft: 15,
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  employeeUsername: {
    fontSize: 22,
    color: '#000',
    fontWeight: 'bold',
  },
  menuContainer: {
    backgroundColor: '#68689E',
    borderRadius: 20,
    padding: 15,
    width: '100%',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
  },
  menuImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  menuTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  menuText: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
  },
  menuSubText: {
    fontSize: 14,
    color: '#999',
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#999',
    marginLeft: 10,
  },
});

export default Profile;
