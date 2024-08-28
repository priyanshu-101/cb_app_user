import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';

const SalaryPage = () => {
  const [salaryDetails, setSalaryDetails] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();

  // Retrieve employeeId from route parameters
  const { employeeId } = route.params;

  useEffect(() => {
    axios.get(`http://localhost:3000/Salary/${employeeId}`)
      .then(response => {
        setSalaryDetails(response.data[0]); // Assuming you get a single record
      })
      .catch(error => {
        console.error('There was an error fetching the salary details!', error);
      });
  }, [employeeId]);

  if (!salaryDetails) {
    return <Text>Loading...</Text>;
  }

  const {
    total_salary,
    advance_taken_amount,
    advance_taken_date,
    bonus_amount,
    bonus_date,
    final_salary,
    employee_name,
  } = salaryDetails;

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backArrow} onPress={() => navigation.navigate('Profile', { employeeId })}>
        <Text style={styles.backArrowText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Salary Details for {employee_name}</Text>

      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={styles.cell}>Base Salary:</Text>
          <Text style={styles.cell}>₹{total_salary}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cell}>Total Advances:</Text>
          <Text style={styles.cell}>₹{advance_taken_amount}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cell}>Advance Date:</Text>
          <Text style={styles.cell}>{advance_taken_date}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cell}>Total Bonuses:</Text>
          <Text style={styles.cell}>₹{bonus_amount}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cell}>Bonus Date:</Text>
          <Text style={styles.cell}>{bonus_date}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cell}>Final Salary:</Text>
          <Text style={styles.cell}>₹{final_salary}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={() => alert('Receipt generated successfully!')}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  backArrow: {
    marginBottom: 20,
  },
  backArrowText: {
    fontSize: 24,
    color: '#333',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  cell: {
    fontSize: 16,
    color: '#555',
  },
  confirmButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SalaryPage;
