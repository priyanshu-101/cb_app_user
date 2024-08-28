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
  const [selectedStatus, setSelectedStatus] = useState(null);
  const route = useRoute();
  const { employeeId, employeeName } = route.params;
  const navigation = useNavigation();

  useEffect(() => {
    const fetchEmployeeDetails = async (name) => {
      try {
        const response = await axios.get(`http://localhost:3000/ViewAtt/${name}`);
        console.log('Fetched data:', response.data); // Log data to check structure
        setEmployeeDetails(response.data || []);
      } catch (error) {
        console.error('Error fetching employee details:', error);
      }
    };

    if (employeeName) {
      fetchEmployeeDetails(employeeName);
    }
  }, [employeeName]);

  const handleCheckboxChange = (index) => {
    const newDays = [...days];
    newDays[index].value = !newDays[index].value;
    setDays(newDays);
  };

  const changeMonth = (delta) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
  };

  const changeYear = (delta) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setFullYear(newDate.getFullYear() + delta);
      return newDate;
    });
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
          days.push(
            <View key={day} style={styles.day}>
              <Text style={[styles.dayText, (currentDay % 7 === 0 || (currentDay + 1) % 7 === 0) ? styles.holidayText : {}]}>
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
  const handleStatusChange = async (status) => {
    setSelectedStatus(status);
  
    try {
      const response = await axios.get(`http://localhost:3000/ViewAtt/${employeeName}`, {
        params: {
          employeeName: employeeName,
          status: status
        }
      });
      console.log('Fetched data:', response.data); // Log data to check structure
      if (status === 'On Leave') {
        setLeaveApplication(response.data || []);
      } else if (status === 'Present') {
        setEmployeeDetails(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const renderEmployeeItem = ({ item }) => (
    <View style={styles.employeeDetails}>
      <Image
        source={{ uri: item.employee_photo ? `data:image/jpeg;base64,${item.employee_photo}` : '' }}
        style={styles.employeePhoto}
      />
      <View style={styles.employeeInfo}>
        <Text style={styles.employeeName}>{item.employee_name || 'N/A'}</Text>
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
        <TouchableOpacity onPress={() => navigation.navigate('Profile', { employeeId })}>
          <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{employeeDetails.length > 0 ? employeeDetails[0].employee_name || 'Loading...' : 'Loading...'}</Text>
        <TouchableOpacity onPress={() => setShowDropdown(!showDropdown)}>
          <Icon name="menu" size={24} color="black" />
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
            <Icon name="arrow-back-ios" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changeMonth(-1)}>
            <Icon name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.month}>
            {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
          </Text>
          <TouchableOpacity onPress={() => changeMonth(1)}>
            <Icon name="arrow-right" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changeYear(1)}>
            <Icon name="arrow-forward-ios" size={24} color="black" />
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
        <TouchableOpacity style={[styles.option, selectedStatus === 'Absent' && styles.selectedButton]} onPress={() => handleStatusChange('Absent')}>
          <Text style={styles.optionText}>Absent</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.option, selectedStatus === 'On Leave' && styles.selectedButton]} onPress={() => handleStatusChange('On Leave')}>
          <Text style={styles.optionText}>On Leave</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.option, selectedStatus === 'Working Days' && styles.selectedButton]} onPress={() => handleStatusChange('Working Days')}>
          <Text style={styles.optionText}>Working Days</Text>
        </TouchableOpacity>
      </View>

      {selectedStatus === 'Present' && (
        <FlatList
          data={employeeDetails}
          renderItem={renderEmployeeItem}
          keyExtractor={(item) => item.employee_id ? item.employee_id.toString() : Math.random().toString()}
          style={styles.employeeList}
        />
      )}

      {selectedStatus === 'On Leave' && (
        <View style={styles.leaveDetailsContainer}>
          <FlatList
            data={leaveApplication}
            renderItem={renderLeaveItem}
            keyExtractor={(item) => item.leave_id ? item.leave_id.toString() : Math.random().toString()}
            style={styles.leaveList}
          />
        </View>
      )}
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#68689E',
    padding: 20,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  dropdown: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    zIndex: 1,
  },
  dropdownItem: {
    padding: 15,
  },
  dropdownText: {
    fontSize: 16,
    color: 'black',
  },
  calendar: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  month: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  week: {
    flexDirection: 'row',
  },
  day: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 16,
  },
  holidayText: {
    color: 'red',
  },
  emptyDay: {
    flex: 1,
  },
  optionsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  option: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    padding: 10,
    margin: 5,
    width: 80,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#4CAF50',
  },
  optionText: {
    color: '#000',
  },
  employeeList: {
    marginTop: 20,
  },
  employeeDetails: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  employeePhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  employeeLocation: {
    fontSize: 14,
    color: 'gray',
  },
  attendanceDate: {
    fontSize: 14,
  },
  leaveDetailsContainer: {
    marginTop: 20,
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  leaveItem: {
    marginBottom: 15,
  },
  leaveReason: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  leaveDate: {
    fontSize: 14,
    color: 'gray',
  },
  attachmentImage: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
  leaveList: {
    marginTop: 20,
  },
});

export default App;

