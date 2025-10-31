import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  Alert,
  KeyboardAvoidingView,
  ScrollView,

} from 'react-native';
import axios from 'axios';
import API from '../utility/API';
import { Loader } from '../utility/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';



const MobileLogin = () => {

  const navigation = useNavigation()
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!mobileNumber || !password) {
      Alert.alert('Validation', 'Please enter both Mobile Number and Password');
      return;
    }

    setLoading(true);
    try {
      // 🔹 Prepare x-www-form-urlencoded data
      const formBody = new URLSearchParams();
      formBody.append('username', mobileNumber);
      formBody.append('password', password);
      formBody.append('grant_type', 'password');

      // 🔹 Step 1: Login API
      const response = await axios.post(
        API.LOGIN,
        formBody.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const data = response.data;
      console.log('Login Response:', data);

      const accessToken = data.access_token;
      const secureID = data.SecurID;

      // 🔹 Validate credentials
      if (!accessToken || !secureID) {
        Alert.alert('Login Failed', 'Invalid credentials');
        setLoading(false);
        return;
      }

      // 🔹 Save tokens
      await AsyncStorage.multiSet([
        ['access_token', accessToken],
        ['SecurID', secureID],
      ]);

      const URL = API.Profile(secureID)
      console.log('Profile URL:', URL);

      // 🔹 Step 2: Fetch profile using secureID
      const profileResponse = await axios.get(
        API.Profile(secureID),
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const profileData = profileResponse.data;
      console.log('Profile Response:', profileData);

      // 🔹 Step 3: Validate and save profile data
      if (profileData.responseStatus && profileData.responseData) {
        const user = profileData.responseData;

        await AsyncStorage.multiSet([
          ['responseText', profileData.responseText || ''],
          ['FullName', user.FullName || ''],
          ['MobileNumber', user.MobileNumber || ''],
          ['ProfilePicture', user.ProfilePicture || ''],
          ['FEVendorID', String(user.FEVendorID || '')],
          ['UserId', String(user.UserId || '')],
        ]);

        navigation.replace('DashboardScreen');
      } else {
        Alert.alert('Error', 'Failed to fetch profile details');
      }
    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading && <Loader />}
      {/* Header with ImageBackground */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ImageBackground
          source={require('../asset/FELogin.png')} // 🔹 your gradient background image
          style={styles.header}
          resizeMode="cover"

        >
          <View style={{ flex: 0.8 }}></View>

          <View style={styles.form}>
            <Text style={styles.loginText}>Login with your mobile no.</Text>
            <View style={{ flexDirection: 'row', alignContent: 'center', alignItems: 'center' }}>
              <View style={styles.inputContainer}>
                <Text style={styles.countryCode}>+91</Text>
              </View>
              <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter mobile no."
                  placeholderTextColor="#888"
                  keyboardType="phone-pad"
                  value={mobileNumber}
                  onChangeText={setMobileNumber}

                />
              </View>


            </View>
            <View style={{ flexDirection: 'row', alignContent: 'center', alignItems: 'center' }}>

              <View style={[styles.inputContainer, { flex: 1 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter password."
                  placeholderTextColor="#888"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}

                />
              </View>


            </View>


            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>


        </ImageBackground>
      </KeyboardAvoidingView>


      {/* Form Section */}

    </View>
  );
};

export default MobileLogin;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    overflow: 'hidden',
    width: '100%',

  },

  form: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    marginTop: 30,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    flex: 0.45


  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00000078",
    borderRadius: 4,
    marginBottom: 15,
    paddingHorizontal: 10,
    height: 50,

  },
  countryCode: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    color: "#000",
  },
  button: {
    backgroundColor: "#006699",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    width: 200,
    alignSelf: 'center',
    marginTop: 20
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginText: {
    textAlign: 'center',
    color: '#525B69',
    fontSize: 21,
    fontWeight: '500',
    marginBottom: 30
  }

});
