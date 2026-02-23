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
  const [showPassword, setShowPassword] = useState(false);

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
    <View style={{ flex: 1 }}>
      {loading && <Loader />}

      <ImageBackground
        source={require('../asset/login_bg1.png')}
        resizeMode="cover"
        style={{ flex: 1 }}   // ✅ full screen background
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
          >

            {/* EMPTY SPACE ABOVE (Top Image Area) */}
            <View style={{ flex: 1 }} />

            {/* FORM SECTION */}
            <View style={styles.form}>
              <Text style={styles.welcomeText}>Welcome to Genius Verify</Text>
              <Text style={styles.loginText}>Login with your mobile no.</Text>

              <View style={{ flexDirection: 'row' }}>
                <View style={styles.inputContainer}>
                  <Text style={styles.countryCode}>+91</Text>
                </View>
                <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
                  <TextInput
                    placeholder="Enter mobile no."
                    placeholderTextColor="#888"
                    keyboardType="phone-pad"
                    style={styles.input}
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                  />
                </View>
              </View>

              <View style={[styles.inputContainer, { flex: 1, position: 'relative' }]}>


                <TextInput
                  placeholder="Enter password"
                  placeholderTextColor="#888"

                  style={styles.input}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 10 }}
                >
                  <Image
                    source={
                      showPassword
                        ? require('../asset/eye_open.png')   // 👁 password visible
                        : require('../asset/eye_close.png')  // 👁 password hidden
                    }
                    style={{ width: 22, height: 22 }}
                  />
                </TouchableOpacity>
              </View>




              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>

            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
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

    padding: 20,
    marginTop: 350


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
    borderWidth: 1,
    backgroundColor: '#FFF'

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
    color: '#ffffffff',
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 30
  },
  welcomeText: {
    textAlign: 'center',
    color: '#ffffffff',
    fontSize: 21,
    fontWeight: '600',
    marginBottom: 30
  }

});
