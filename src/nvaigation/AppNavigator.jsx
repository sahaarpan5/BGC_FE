import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DrawerActions, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import MobileLogin from '../screen/MobileLogin';
import DashboardScreen from '../screen/DashboardScreen';

const Stack = createNativeStackNavigator();


const AppNavigator = () => {

  return (
    <SafeAreaProvider >

      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="MobileLogin">
        <Stack.Screen name="MobileLogin" component={MobileLogin} />
        <Stack.Screen name="DashboardScreen" component={DashboardScreen} />
       
      </Stack.Navigator>

    </SafeAreaProvider>


  );
};

export default AppNavigator;