import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';

const HolidayList = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { employeeId } = route.params;

  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/HolidayList/${employeeId}')
      .then(response => {
        setHolidays(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the holiday data!', error);
      });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile', { employeeId })}>
          <Icon name="arrow-back" size={24} color="black" style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.heading}>Public Holidays</Text>
        <Icon name="calendar" size={24} color="grey" style={styles.icon} />
      </View>
      <FlatList
        data={holidays}
        keyExtractor={(item) => item.holiday_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemName}>{item.holiday_name}</Text>
            <Text style={styles.itemDate}>{new Date(item.holiday_date).toDateString()}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#68689E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  icon: {
    padding: 10,
    color: 'black',
  },
  item: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  itemDate: {
    fontSize: 16,
    color: '#555',
  },
});

export default HolidayList;
