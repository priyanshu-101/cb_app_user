import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

const App = () => {
  const [days, setDays] = useState([
    { label: 'NO punch out', value: false },
    { label: 'Present Day', value: false },
    { label: 'Half Day', value: false },
    { label: 'On Leave', value: false }
  ]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [employeeDetails, setEmployeeDetails] = useState([]);
  const [leaveApplication, setLeaveApplication] = useState([]);
  const [presentDates, setPresentDates] = useState([]);
  const [leaveDates, setLeaveDates] = useState([]);
  const [absentDates, setAbsentDates] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const route = useRoute();
  const { employeeUsername } = route.params;
  const navigation = useNavigation();

  useEffect(() => {
    const fetchEmployeeDetails = async (username) => {
      try {
        const response = await axios.get(`http://localhost:3000/ViewAtt/${username}`);
        console.log('Fetched data:', response.data);
        setEmployeeDetails(response.data || []);
      } catch (error) {
        console.error('Error fetching employee details:', error);
      }
    };

    if (employeeUsername) {
      fetchEmployeeDetails(employeeUsername);
    }
  }, [employeeUsername]);

  useEffect(() => {
    const absentDays = Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }, (_, i) => i + 1).filter(day => !presentDates.includes(day) && !leaveDates.includes(day));
    setAbsentDates(absentDays);
  }, [presentDates, leaveDates, currentDate]);

  const changeMonth = (delta) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
    handleStatusChange(selectedStatus); // Refresh data when month changes
  };

  const changeYear = (delta) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setFullYear(newDate.getFullYear() + delta);
      return newDate;
    });
    handleStatusChange(selectedStatus); // Refresh data when year changes
  };

  const handleStatusChange = async (status) => {
    setSelectedStatus(status);

    try {
      const response = await axios.get(`http://localhost:3000/ViewAtt/${employeeUsername}`, {
        params: {
          employeeUsername: employeeUsername,
          status: status,
          month: currentDate.getMonth() + 1, // JS months are 0-indexed
          year: currentDate.getFullYear()
        }
      });
      console.log('Fetched data:', response.data);

      if (status === 'On Leave') {
        setLeaveApplication(response.data || []);
        setLeaveDates(response.data.map(item => new Date(item.attendance_date).getDate()));
      } else if (status === 'Present') {
        setEmployeeDetails(response.data || []);
        setPresentDates(response.data.map(item => new Date(item.attendance_date).getDate()));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const renderDays = () => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const weeks = [];
    let currentDay = 1;

    for (let week = 0; week < 6; week++) {
      const days = [];
      for (let day = 0; day < 7; day++) {
        if (week === 0 && day < firstDay) {
          days.push(<View key={day} style={styles.emptyDay} />);
        } else if (currentDay <= daysInMonth) {
          const isPresent = presentDates.includes(currentDay);
          const isOnLeave = leaveDates.includes(currentDay);
          const isAbsent = !isPresent && !isOnLeave;
          days.push(
            <View key={day} style={styles.day}>
              <Text style={[
                styles.dayText,
                isPresent ? styles.presentDay :
                isOnLeave ? styles.leaveDay :
                isAbsent ? styles.absentDay : styles.dayText
              ]}>
                {currentDay}
              </Text>
            </View>
          );
          currentDay++;
        } else {
          days.push(<View key={day} style={styles.emptyDay} />);
        }
      }
      weeks.push(
        <View key={week} style={styles.week}>
          {days}
        </View>
      );
    }
    return weeks;
  };

  const renderEmployeeItem = ({ item }) => (
    <View style={styles.employeeDetails}>
      <Image
        source={{ uri: item.employee_photo ? `data:image/jpeg;base64,${item.employee_photo}` : '' }}
        style={styles.employeePhoto}
      />
      <View style={styles.employeeInfo}>
        <Text style={styles.employeeName}>{item.employee_username || 'N/A'}</Text>
        <Text style={styles.employeeLocation}>{item.city || 'N/A'}</Text>
        <Text style={styles.attendanceDate}>Date: {item.attendance_date || 'N/A'}</Text>
      </View>
    </View>
  );

  const renderLeaveItem = ({ item }) => (
    <View style={styles.leaveItem}>
      <Text style={styles.leaveReason}>Reason: {item.reason || 'N/A'}</Text>
      <Text style={styles.leaveDate}>Applied on: {item.applied_on ? new Date(item.applied_on).toLocaleDateString() : 'N/A'}</Text>
      {item.attachment_file && (
        <Image
          source={{ uri: item.attachment_file ? `data:image/jpeg;base64,${item.attachment_file}` : '' }}
          style={styles.attachmentImage}
        />
      )}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile', { employeeUsername: route.params?.employeeUsername })}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{employeeDetails.length > 0 ? employeeDetails[0].employee_username || 'Loading...' : 'Loading...'}</Text>
        <TouchableOpacity onPress={() => setShowDropdown(!showDropdown)}>
          <Icon name="menu" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {showDropdown && (
        <View style={styles.dropdown}>
          <TouchableOpacity style={styles.dropdownItem} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.dropdownText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.calendar}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => changeYear(-1)}>
            <Icon name="arrow-back-ios" size={24} color="#007bff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changeMonth(-1)}>
            <Icon name="arrow-left" size={24} color="#007bff" />
          </TouchableOpacity>
          <Text style={styles.month}>
            {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
          </Text>
          <TouchableOpacity onPress={() => changeMonth(1)}>
            <Icon name="arrow-right" size={24} color="#007bff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changeYear(1)}>
            <Icon name="arrow-forward-ios" size={24} color="#007bff" />
          </TouchableOpacity>
        </View>
        <View style={styles.weekDays}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <Text key={index} style={styles.weekDayText}>{day}</Text>
          ))}
        </View>
        {renderDays()}
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity style={[styles.option, selectedStatus === 'Present' && styles.selectedButton]} onPress={() => handleStatusChange('Present')}>
          <Text style={styles.optionText}>Present</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.option, selectedStatus === 'On Leave' && styles.selectedButton]} onPress={() => handleStatusChange('On Leave')}>
          <Text style={styles.optionText}>On Leave</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={selectedStatus === 'Present' ? employeeDetails : leaveApplication}
        keyExtractor={(item, index) => index.toString()}
        renderItem={selectedStatus === 'Present' ? renderEmployeeItem : renderLeaveItem}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8f8f8',
    padding: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  dropdown: {
    backgroundColor: '#fff',
    elevation: 2,
    borderRadius: 4,
    position: 'absolute',
    right: 0,
    top: 50,
    width: 150
  },
  dropdownItem: {
    padding: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1
  },
  dropdownText: {
    fontSize: 16,
    color: '#333'
  },
  calendar: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
    padding: 20,
    marginBottom: 20
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  month: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff'
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333'
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  day: {
    flex: 1,
    alignItems: 'center',
    padding: 10
  },
  dayText: {
    fontSize: 16,
    color: '#333'
  },
  presentDay: {
    color: 'green',
    fontWeight: 'bold'
  },
  leaveDay: {
    color: 'orange',
    fontWeight: 'bold'
  },
  absentDay: {
    color: 'red',
    fontWeight: 'bold'
  },
  emptyDay: {
    flex: 1,
    padding: 10
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20
  },
  option: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 8
  },
  selectedButton: {
    backgroundColor: '#0056b3'
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  employeeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    elevation: 2
  },
  employeePhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10
  },
  employeeInfo: {
    flex: 1
  },
  employeeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  employeeLocation: {
    fontSize: 14,
    color: '#666'
  },
  attendanceDate: {
    fontSize: 14,
    color: '#666'
  },
  leaveItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    elevation: 2,
    marginBottom: 10
  },
  leaveReason: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  leaveDate: {
    fontSize: 14,
    color: '#666'
  },
  attachmentImage: {
    width: 100,
    height: 100,
    marginTop: 10
  }
});

export default App;
