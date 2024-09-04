import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Button, Platform, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

const App = () => {
  const [applicationText, setApplicationText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [name, setName] = useState('');
  const route = useRoute();
  const { employeeUsername } = route.params;
  const navigation = useNavigation();

  const handleAttachment = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/pdf';
      input.onchange = async (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const uri = reader.result;
            setAttachments(prev => [...prev, { uri, name: file.name }]);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      Alert.alert('File Picker', 'Please implement a file picker or use a library for mobile file selection.');
    }
  };

  const handleSendApplication = async () => {
    if (name.trim() === '' || applicationText.trim() === '') {
      Alert.alert('Error', 'Name and application text cannot be empty.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('reason', applicationText);
      formData.append('employee_username', employeeUsername); // Use employee_username as per backend

      if (attachments.length > 0) {
        const file = attachments[0];
        formData.append('attachment', {
          uri: file.uri,
          type: 'application/pdf', // Ensure this matches the expected MIME type on your backend
          name: file.name
        });
      }

      const response = await axios.post(`http://localhost:3000/Application/${employeeUsername}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      Alert.alert('Success', response.data);
      setApplicationText('');
      setAttachments([]);
      setName('');
    } catch (error) {
      console.error('Error sending application:', error);
      Alert.alert('Error', 'Failed to send application. Please try again.');
    }
  };

  const handleDownload = (uri) => {
    if (Platform.OS === 'web') {
      const link = document.createElement('a');
      link.href = uri;
      link.download = uri.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      Alert.alert('Download', 'Please implement a download function or use a library for mobile file downloading.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile', { employeeUsername })}>
          <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Leave Application</Text>
      </View>

      <View style={styles.applicationForm}>
        <TextInput
          style={styles.textInput}
          placeholder="Your Name"
          onChangeText={setName}
          value={name}
        />
        <TextInput
          style={styles.textInput}
          placeholder="Start application..."
          multiline
          numberOfLines={4}
          onChangeText={setApplicationText}
          value={applicationText}
        />
        <View style={styles.buttonRow}>
          <Button title="Attach Document" onPress={handleAttachment} />
          <Button title="Send" onPress={handleSendApplication} />
        </View>
        <View style={styles.attachmentContainer}>
          {attachments.length > 0 ? (
            attachments.map((file, index) => (
              <View key={index} style={styles.attachmentItem}>
                <Text style={styles.attachmentText}>{file.name}</Text>
                <TouchableOpacity onPress={() => {
                  setAttachments(prev => prev.filter((_, i) => i !== index));
                }}>
                  <Text style={styles.removeButton}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noAttachments}>No documents attached.</Text>
          )}
        </View>
      </View>

      {/* Add this section if you have sent applications data */}
      {/* {sentApplications.length > 0 && (
        <View style={styles.sentApplications}>
          <Text style={styles.sentApplicationsTitle}>Sent Applications</Text>
          <View style={styles.columnsContainer}>
            {sentApplications.map((app, index) => (
              <View key={index} style={styles.applicationColumn}>
                <Text style={styles.applicationText}>{app.name}</Text>
                <Text style={styles.applicationText}>{app.text}</Text>
                <Text style={styles.applicationDate}>{`Date: ${app.date} Time: ${app.time}`}</Text>
                <Text style={styles.applicationStatus}>{`Status: ${app.status}`}</Text>
                <View style={styles.attachmentContainer}>
                  {app.attachments.length > 0 ? (
                    app.attachments.map((file, fileIndex) => (
                      <TouchableOpacity key={fileIndex} onPress={() => handleDownload(file.uri)}>
                        <Text style={styles.attachmentText}>{file.name}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.noAttachments}>No documents attached.</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      )} */}
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
    paddingVertical: 10,
    borderRadius: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  applicationForm: {
    width: '100%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  textInput: {
    width: '100%',
    height: 100,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  attachmentContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  attachmentText: {
    fontSize: 16,
    color: 'black',
    flex: 1,
  },
  removeButton: {
    color: 'red',
  },
  noAttachments: {
    fontSize: 16,
    color: 'gray',
  },
  sentApplications: {
    width: '100%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  sentApplicationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },
  columnsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  applicationColumn: {
    width: '48%',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  applicationText: {
    fontSize: 16,
    color: 'black',
    marginBottom: 5,
  },
  applicationDate: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 5,
  },
  applicationStatus: {
    fontSize: 14,
    color: 'blue',
    marginBottom: 10,
  },
});

export default App;
