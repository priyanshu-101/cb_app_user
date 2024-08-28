import  Login  from '../(tabs)/Login'
import Profile from '../(tabs)/Profile'
import HolidayList from '../(tabs)/HolidayList'
import Employees from '../(tabs)/Employee'
import Leave from '../(tabs)/Leave'
import ViewAtt from '../(tabs)/ViewAtt'
import Application from '../(tabs)/Application'

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
       <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* <Stack.Screen name="Home" component={Home} options={{ title: 'Home' }} />
       
        <Stack.Screen name="AddEmployee" component={AddEmployee} options={{ title: 'Add Employee' }} />
        
        
        <Stack.Screen name="EmpStatus" component={EmpStatus} />*/}
        <Stack.Screen name='Leave' component={Leave} options={{title:'Leave'}}/>
        <Stack.Screen name="Employees" component={Employees} />
         <Stack.Screen name="HolidayList" component={HolidayList} options={{ title: 'Public Holidays' }} />
        <Stack.Screen name='Profile' component={Profile}/> 
        <Stack.Screen name='Login' component={Login}/>
        <Stack.Screen name='ViewAtt' component={ViewAtt}/>
        <Stack.Screen name='Application' component={Application}/>
        {/* <Stack.Screen name='ListEmp' component={ListEmp}/> */}
        </Stack.Navigator>
    


    </NavigationContainer>
  );
};

export default App;
