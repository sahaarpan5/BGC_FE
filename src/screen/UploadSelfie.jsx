import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
    Image,
    SafeAreaView,
    FlatList,
    Linking,
    Modal,
    ScrollView,
    PermissionsAndroid,
    Alert,

} from 'react-native';
import axios from 'axios';
import Geocoder from 'react-native-geocoding';
import Geolocation from '@react-native-community/geolocation';
import { launchCamera } from 'react-native-image-picker';
import { Loader } from '../utility/Loader';
import API from '../utility/API';
import AsyncStorage from '@react-native-async-storage/async-storage';


const UploadSelfie = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { latt: routLatt, lng: routeLng, candidateId: routeCandidateId } = route.params || {};
    console.log('laatitue', routLatt);
    console.log('Longitude', routeLng);
    console.log('routeCandidateId', routeCandidateId);
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState('Fetching address......');
    const [loading, setLoading] = useState(false);

    const [selfiecapturedImage, setselfiecapturedImage] = useState(null);


    const [coords, setCoords] = useState({
        latitude: routLatt || 11.00,
        longitude: routeLng || 11.00,
    });


    useEffect(() => {

        const getLocation = async () => {
            try {
                setLoading(true);
                if (Platform.OS === 'android') {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                        {
                            title: 'Location Permission',
                            message: 'This app needs access to your location to mark attendance.',
                            buttonNeutral: 'Ask Me Later',
                            buttonNegative: 'Cancel',
                            buttonPositive: 'OK',
                        }
                    );

                    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                        Alert.alert('Permission Denied', 'Location permission is required.');
                        setLoading(false);
                        return;
                    }
                } else {
                    Geolocation.requestAuthorization();
                    // const permission = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
                    // if (permission !== RESULTS.GRANTED) {
                    //   Alert.alert('Permission Denied', 'Location permission is required.');
                    //   return;
                    // }
                    // iOS only
                }

                // Now get location
                Geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        console.log('📍 Current Coordinates =>');
                        console.log('Latitude:', latitude);
                        console.log('Longitude:', longitude);
                        setCoords({ latitude, longitude });
                        setLocation({
                            latitude,
                            longitude,
                            latitudeDelta: 0.005,
                            longitudeDelta: 0.005,
                        });




                        Geocoder.from(latitude, longitude)
                            .then((json) => {
                                if (json.results.length > 0) {
                                    const address = json.results[0].formatted_address;
                                    setAddress(address);
                                } else {
                                    setAddress('Address not found');
                                }

                                setLoading(false);
                            })
                            .catch((error) => {
                                console.warn('❌ Geocoding error:', error);
                                setAddress('Unable to get address');
                                setLoading(false);
                            });
                    },
                    (error) => {
                        console.warn('❌ Error getting location:', error);

                        setAddress('Unable to get location');
                        setLoading(false);
                    },
                    {
                        enableHighAccuracy: false,
                        timeout: 100000,
                        maximumAge: 10000,
                    }
                );
            } catch (err) {
                console.warn('❌ Permission or location error:', err);
                Alert.alert('Error', 'An unexpected error occurred while getting your location.');
                setLoading(false);
            }
        };

        getLocation();
    }, []);


    const requestCameraPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Camera Permission',
                        message: 'This app needs access to your camera to take attendance pictures.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    };
    const openCamera = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Camera permission is required to take a photo.');
            return;
        }

        launchCamera(
            {
                mediaType: 'photo',
                cameraType: 'front',
                saveToPhotos: true,
            },
            (response) => {
                if (response.didCancel) return;
                if (response.errorCode) {
                    console.log('Camera error:', response.errorMessage);
                } else {
                    const source = { uri: response.assets[0].uri };
                    setselfiecapturedImage(source);
                }
            }
        );
    };


    const docUpload = async (fileUri, fileName) => {

        // Validation


        try {
            const token = await AsyncStorage.getItem('access_token');
            const id = await AsyncStorage.getItem('UserId');
            console.log('token', token);
            console.log('candidateID', routeCandidateId);




            if (!token) {
                Alert.alert('Error', 'User session expired. Please log in again.');
                return;
            }

            setLoading(true);

            const formData = new FormData();
            formData.append('CandidateId', routeCandidateId);
            formData.append('UserId', id);
            formData.append('Lat', coords.latitude.toString());
            formData.append('Lng', coords.longitude.toString());
            formData.append('img_1', {
                uri: fileUri,
                type: 'image/png',
                name: fileName,
            });
            // file is null → skip file append

            const response = await axios.post(API.FORMFINALUPLOAD, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('API Response:', response.data);
            const { responseData, responseText, responseStatus } = response.data;

            if (responseStatus) {
                Alert.alert('Success',  'Form has been uploaded successfully!');
                navigation.replace('DashboardScreen')

            } else {
                Alert.alert('Error', responseText || 'Upload failed!');
            }
        } catch (error) {
            console.error('API Error:', error);
            Alert.alert('Error', 'Unable to save data. Please try again.');
        } finally {
            setLoading(false); // 🔹 hide loader
        }
    };





    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#006699' }}>
            {loading && <Loader />}
            <View style={styles.container}>
                <View style={styles.toolBar}>
                    <Text style={styles.toolbarText}>
                        Upload Selfie
                    </Text>
                </View>

                <ScrollView style={styles.mainContainer}>
                    <View style={styles.childraw}>

                        <View style={styles.inputBox}>

                            <Image
                                source={selfiecapturedImage || require('../asset/selfie.png')}
                                style={styles.selfieImage}></Image>

                            <Text style={styles.selfieTitle}>Take a selfie!</Text>
                            <Text style={styles.selfieText}>Make sure you are standing within 500 meters of
                                the candidate's address.</Text>

                            <TouchableOpacity style={styles.uploadButton} onPress={openCamera}>

                                <Text style={styles.detailsText}>Start Camera</Text>
                            </TouchableOpacity>





                        </View>
                    </View>



                    {selfiecapturedImage && (
                        <>

                            <TouchableOpacity style={styles.detailsButton} onPress={() =>
                                docUpload(selfiecapturedImage.uri, 'selfie.png')
                            }>
                                <Text style={styles.detailsText}>Save & Finish</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    <View style={{ height: 40 }}></View>





                </ScrollView>




            </View>
        </SafeAreaView>

    );
};

export default UploadSelfie;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    toolBar: {
        height: 60,
        width: '100%',
        backgroundColor: '#006699',
        justifyContent: 'center',
        alignItems: 'center'
    },
    toolbarText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '600',
        letterSpacing: 1
    },
    title: {
        color: '#000000ff',
        fontSize: 14,
        fontWeight: '400',
        letterSpacing: 1,
        marginLeft: 5
    },
    raw: {
        flexDirection: 'row',
        marginBottom: 8,
        alignContent: 'center'
    },

    childraw: {

        marginVertical: 10,

    },
    inputBox: {
        width: '100%',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#c2c2c2ff',
        height: 500,
        alignItems: 'center',
        justifyContent: 'center'
    },
    inputText: {
        color: '#000000',
        fontSize: 14
    },
    headerTitle: {
        color: '#6B6A6A',
        fontWeight: '700',
        letterSpacing: 2,
        fontSize: 20,
        textAlign: 'center',
        marginVertical: 20
    },
    mainContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 20,
        borderColor: '#c2c2c2ff',
        borderWidth: 1,
        borderRadius: 16,
        marginHorizontal: 10,
        marginBottom: 10
    },
    detailsButton: {
        backgroundColor: "#006699",
        paddingVertical: 6,
        paddingHorizontal: 12,
        height: 50,
        borderRadius: 4,
        marginTop: 20,
        justifyContent: 'center'
    },
    detailsText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
        letterSpacing: 1,
        textAlign: 'center'
    },


    uploadButton: {
        backgroundColor: "#EE1171",
        paddingVertical: 6,
        paddingHorizontal: 12,
        height: 50,
        borderRadius: 4,
        justifyContent: 'center',
        width: 150,
        marginHorizontal: 10,
        marginVertical: 30,
        top: 60
    },
    selfieImage: {
        height: 180,
        width: 180
    },
    selfieTitle: {
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: 1,
        color: '#000000',
        marginVertical: 10
    },
    selfieText: {
        fontSize: 16,
        fontWeight: '400',
        color: '#b9aaaaff',
        marginVertical: 10,
        textAlign: 'center'
    }


});
