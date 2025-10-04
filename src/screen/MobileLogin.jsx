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
            const formData = new FormData();
            formData.append('_id_', mobileNumber);
            formData.append('_pass_', password);

            // Axios POST request with multipart/form-data
            const response = await axios.post(API.LOGIN, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const res = response.data;
            console.log('Login Response:', res);

            if (res.responseStatus) {


                const { responseText, responseData } = res;
                await AsyncStorage.setItem('responseText', responseText || '');
                await AsyncStorage.setItem('FullName', responseData?.FullName || '');
                await AsyncStorage.setItem('MobileNumber', responseData?.MobileNumber || '');
                await AsyncStorage.setItem('ProfilePicture', responseData?.ProfilePicture || '');
                await AsyncStorage.setItem('FEVendorID', responseData?.FEVendorID?.toString() || '');
                await AsyncStorage.setItem('UserId', responseData?.UserId?.toString() || '');
                



                navigation.replace('DashboardScreen')
            } else {
                Alert.alert('Login Failed', res.responseText || 'Invalid credentials');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {loading && <Loader />}
            {/* Header with ImageBackground */}
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
