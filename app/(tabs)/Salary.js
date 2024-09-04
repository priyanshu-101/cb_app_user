import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

const PayScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployeeDetails = useCallback(async () => {
    try {
      const employeeUsername = route.params?.employeeUsername;
      if (!employeeUsername) {
        Alert.alert('Error', 'Employee username is missing from route params');
        navigation.goBack();
        setLoading(false);
        return;
      }

      // Fetch employee details from the API
      const response = await axios.get(`http://localhost:3000/Salary/${employeeUsername}`);
      const employeeDetails = response.data;

      if (!Array.isArray(employeeDetails)) {
        Alert.alert('Error', 'Unexpected data format');
        setLoading(false);
        return;
      }

      // Update state with fetched data
      const formattedData = employeeDetails.map(detail => {
        const totalSalary = parseFloat(detail.total_salary) || 0;
        const totalAdvances = parseFloat(detail.advance_taken_amount) || 0;
        const totalBonuses = parseFloat(detail.bonus_amount) || 0;
        const finalSalary = totalSalary - totalAdvances - totalBonuses;

        return {
          id: detail.id.toString(),
          advance: detail.advance_taken_amount || 'N/A',
          advanceReason: detail.advance_reason || 'N/A',
          bonus: detail.bonus_amount || 'N/A',
          bonusReason: detail.bonus_reason || 'N/A',
          date: detail.advance_taken_date || detail.bonus_date || 'N/A',
          totalSalary: totalSalary.toFixed(2),
          finalSalary: finalSalary.toFixed(2),
          isConfirmed: detail.is_confirmed || false,
        };
      });

      setData(formattedData);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch employee details');
      console.error('Error fetching employee details:', error);
    } finally {
      setLoading(false);
    }
  }, [route.params?.employeeUsername, navigation]);

  useEffect(() => {
    fetchEmployeeDetails();
  }, [fetchEmployeeDetails]);

  const onConfirm = async (item) => {
    try {
      const advanceDate = item.advance !== 'N/A' ? new Date(item.date).toISOString().slice(0, 19).replace('T', ' ') : null;
      const bonusDate = item.bonus !== 'N/A' ? new Date(item.date).toISOString().slice(0, 19).replace('T', ' ') : null;
  
      // Check for existing record
      const checkResponse = await axios.get(`http://localhost:3000/Salary/check`, {
        params: {
          employee_username: route.params?.employeeUsername,
          advance_taken_amount: item.advance !== 'N/A' ? parseFloat(item.advance) : null,
          bonus_amount: item.bonus !== 'N/A' ? parseFloat(item.bonus) : null,
          advance_taken_date: advanceDate,
          bonus_date: bonusDate,
        },
      });
  
      if (checkResponse.data.exists) {
        Alert.alert('Notice', 'Record already exists with the same details');
        return;
      }
  
      // Post new record if no existing record
      const response = await axios.post(`http://localhost:3000/Salary/${route.params?.employeeUsername}`, {
        total_salary: parseFloat(item.totalSalary),
        advance_taken_amount: item.advance !== 'N/A' ? parseFloat(item.advance) : null,
        advance_taken_date: advanceDate,
        bonus_amount: item.bonus !== 'N/A' ? parseFloat(item.bonus) : null,
        bonus_date: bonusDate,
        final_salary: parseFloat(item.finalSalary),
        employee_username: route.params?.employeeUsername,
        advance_reason: item.advanceReason !== 'N/A' ? item.advanceReason : null,
        bonus_reason: item.bonusReason !== 'N/A' ? item.bonusReason : null
      });
  
      if (response.status === 200) {
        // Show success popup
        Alert.alert(
          'Success',
          'Salary details confirmed successfully',
          [
            {
              text: 'OK',
              onPress: () => fetchEmployeeDetails(), // Optionally refresh the data
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to confirm salary details');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while confirming salary details');
      console.error('Error confirming salary:', error);
    }
  };
  

  const renderItem = useCallback(({ item }) => (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{item.advance}</Text>
      <Text style={styles.tableCell}>{item.advanceReason}</Text>
      <Text style={styles.tableCell}>{item.bonus}</Text>
      <Text style={styles.tableCell}>{item.bonusReason}</Text>
      <Text style={styles.tableCell}>{item.date}</Text>
      <Text style={styles.tableCell}>{item.totalSalary}</Text>
      <Text style={styles.tableCell}>{item.finalSalary}</Text>
      {!item.isConfirmed && (
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={() => onConfirm(item)}
        >
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      )}
    </View>
  ), [onConfirm]);

  if (loading) {
    return <ActivityIndicator size="large" color="#007bff" style={styles.loadingIndicator} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Profile', { employeeUsername: route.params?.employeeUsername })}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderCell}>Advance</Text>
          <Text style={styles.tableHeaderCell}>Advance Reason</Text>
          <Text style={styles.tableHeaderCell}>Bonus</Text>
          <Text style={styles.tableHeaderCell}>Bonus Reason</Text>
          <Text style={styles.tableHeaderCell}>Date</Text>
          <Text style={styles.tableHeaderCell}>Total Salary</Text>
          <Text style={styles.tableHeaderCell}>Final Salary</Text>
          <Text style={styles.tableHeaderCell}>Action</Text>
        </View>

        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  headerTitle: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  confirmButton: {
    padding: 8,
    backgroundColor: '#28a745',
    borderRadius: 5,
    marginTop: 5,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  table: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 5,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    backgroundColor: '#007bff',
  },
  tableHeaderCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'left', // Aligns header text to the left
    color: '#fff',
    paddingHorizontal: 10, // Added padding for better alignment
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#dee2e6',
    backgroundColor: '#fff',
  },
  tableCell: {
    flex: 1,
    textAlign: 'left', // Aligns data text to the left
    color: '#333',
    paddingHorizontal: 10, // Added padding for better alignment
  },
  flatListContent: {
    paddingBottom: 20,
  },
});



export default PayScreen;
