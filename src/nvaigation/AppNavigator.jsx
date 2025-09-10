import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DrawerActions, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import MobileLogin from '../screen/MobileLogin';
import DashboardScreen from '../screen/DashboardScreen';
import VerificationForm from '../screen/VerificationForm';
import VerfifcationDocument from '../screen/VerfifcationDocument';
import UploadSelfie from '../screen/UploadSelfie';



const Stack = createNativeStackNavigator();


const AppNavigator = () => {

  return (
    <SafeAreaProvider >

      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="MobileLogin">
        <Stack.Screen name="MobileLogin" component={MobileLogin} />
        <Stack.Screen name="DashboardScreen" component={DashboardScreen} />
         <Stack.Screen name="VerificationForm" component={VerificationForm} />
         <Stack.Screen name="VerfifcationDocument" component={VerfifcationDocument} />
       <Stack.Screen name="UploadSelfie" component={UploadSelfie} />
      </Stack.Navigator>

    </SafeAreaProvider>


  );
};

export default AppNavigator;