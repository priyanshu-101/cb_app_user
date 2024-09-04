import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

const NoticesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [notices, setNotices] = useState([]);
  const [visible, setVisible] = useState(null);
  const [confirmedNotices, setConfirmedNotices] = useState(new Set());
  const { employeeUsername } = route.params; // Update to use employeeUsername

  useEffect(() => {
    // Fetch notices from the backend API
    axios.get(`http://localhost:3000/Notice/${employeeUsername}`)
      .then(response => {
        setNotices(response.data);
      })
      .catch(error => {
        console.error('Error fetching notices:', error);
      });
  }, [employeeUsername]);

  const handleBackPress = () => {
    navigation.navigate('Profile', { employeeUsername });
  };

  const handleThreeDotsPress = (id) => {
    setVisible(visible === id ? null : id);
  };

  const handleConfirm = (id) => {
    if (confirmedNotices.has(id)) {
      Alert.alert('Notice Already Confirmed', 'You have already confirmed this notice.');
    } else {
      // Update the notice as confirmed in the backend
      axios.post(`http://localhost:3000/Notice/${employeeUsername}`, { notice_id: id })

        .then(() => {
          Alert.alert('Confirmation', 'Notice confirmed successfully!');
          setConfirmedNotices(prev => new Set(prev).add(id));
          setNotices(prevNotices => prevNotices.map(notice =>
            notice.id === id ? { ...notice, confirmed: true } : notice
          ));
        })
        .catch(error => {
          console.error('Error confirming notice:', error);
        });
    }
    setVisible(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Icon name="arrow-back" type="material" color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Notices</Text>
      </View>

      {notices.map(notice => (
        <View style={styles.noticeContainer} key={notice.id}>
          <View style={styles.notice}>
            <View style={styles.noticeHeader}>
              <Text style={styles.noticeDate}>{new Date(notice.timestamp).toLocaleDateString()}</Text>
              <TouchableOpacity onPress={() => handleThreeDotsPress(notice.id)}>
                <Icon name="more-vert" type="material" color="gray" />
              </TouchableOpacity>
              {visible === notice.id && (
                <TouchableOpacity style={styles.confirmOption} onPress={() => handleConfirm(notice.id)}>
                  <Text style={styles.confirmText}>Confirm</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.noticeTitle}>Notice {notice.id}</Text>
            <Text style={styles.noticeContent}>{notice.text}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#68689E',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  noticeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notice: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noticeDate: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 5,
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  noticeContent: {
    fontSize: 16,
    color: '#666',
  },
  confirmOption: {
    position: 'absolute',
    top: 30,
    right: 10,
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  confirmText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default NoticesScreen;
