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
    StatusBar,

} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import API from '../utility/API';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Loader } from '../utility/Loader';


const VerfifcationDocument = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [feedbackId, setFeedbackId] = useState('');
    const [autoInID, setAutoInID] = useState('');
    const [candidateId, setCandidateId] = useState('');


    const [houeOnecapturedImage, setHoueOnecapturedImage] = useState(null);
    const [houeTwocapturedImage, setHoueTwocapturedImage] = useState(null);
    const [addressProofcapturedImage, setaddressProofcapturedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [houeOneUploaded, setHoueOneUploaded] = useState(false);
    const [houeTwoUploaded, setHoueTwoUploaded] = useState(false);
    const [addressProofUploaded, setAddressProofUploaded] = useState(false);

    const [houeOneUploadedID, setHoueOneUploadedID] = useState('');
    const [houeTwoUploadedID, setHoueTwoUploadedID] = useState('');
    const [addressProofUploadedID, setAddressProofUploadedID] = useState('');
    const { latt: routLatt, lng: routeLng } = route.params || {};

    console.log('laatitue', routLatt);
    console.log('Longitude', routeLng);



    useEffect(() => {
        const loadParams = async () => {
            const routeFeedbackId = route.params?.feedbackId;
            const routeAutoInID = route.params?.autoInID;
            const routeCandidateId = route.params?.candidateId;

            setCandidateId(routeCandidateId);
            if (routeFeedbackId && routeAutoInID) {
                setFeedbackId(routeFeedbackId);
                setAutoInID(routeAutoInID);

            } else {
                // fallback if route params are empty
                const storedFeedbackId = await AsyncStorage.getItem('feedbackId');
                const storedAutoInID = await AsyncStorage.getItem('autoInID');

                setFeedbackId(storedFeedbackId || '');
                setAutoInID(storedAutoInID || '');

            }

        };

        loadParams();
    }, [route.params]);

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
    const openCameraforHouseOne = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Camera permission is required to take a photo.');
            return;
        }

        launchCamera(
            {
                mediaType: 'photo',
                cameraType: 'back',
                saveToPhotos: true,
            },
            (response) => {
                if (response.didCancel) return;
                if (response.errorCode) {
                    console.log('Camera error:', response.errorMessage);
                } else {
                    const source = { uri: response.assets[0].uri };
                    setHoueOnecapturedImage(source);
                }
            }
        );
    };


    const openCameraforHouseTwo = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Camera permission is required to take a photo.');
            return;
        }

        launchCamera(
            {
                mediaType: 'photo',
                cameraType: 'back',
                saveToPhotos: true,
            },
            (response) => {
                if (response.didCancel) return;
                if (response.errorCode) {
                    console.log('Camera error:', response.errorMessage);
                } else {
                    const source = { uri: response.assets[0].uri };
                    setHoueTwocapturedImage(source);
                }
            }
        );
    };


    const openCameraforAddressProof = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Camera permission is required to take a photo.');
            return;
        }

        launchCamera(
            {
                mediaType: 'photo',
                cameraType: 'back',
                saveToPhotos: true,
            },
            (response) => {
                if (response.didCancel) return;
                if (response.errorCode) {
                    console.log('Camera error:', response.errorMessage);
                } else {
                    const source = { uri: response.assets[0].uri };
                    setaddressProofcapturedImage(source);
                }
            }
        );
    };


    const docUpload = async (fileUri, fileName) => {

        // Validation


        try {
            const token = await AsyncStorage.getItem('access_token');
            console.log('token', token);
            console.log('candidateID', candidateId);
            console.log('feedbackId', feedbackId);



            if (!token) {
                Alert.alert('Error', 'User session expired. Please log in again.');
                return;
            }

            setLoading(true);

            const formData = new FormData();
            formData.append('Candidateid', candidateId);
            formData.append('ResidanceFeedbackId', feedbackId);
            formData.append('img_1_name', fileName);
            formData.append('img_1', {
                uri: fileUri,
                type: 'image/png',
                name: fileName,
            });
            // file is null → skip file append

            const response = await axios.post(API.DOCUMENTUPLOAD, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('API Response:', response.data);
            const { responseData, responseText, responseStatus } = response.data;

            if (responseStatus) {
                Alert.alert('Success', 'Document uploaded successfully!');
                if (fileName === 'HouseImageOne.png') {
                    setHoueOneUploaded(true);
                    setHoueOneUploadedID(responseData);
                } else if (fileName === 'HouseImageTwo.png') {
                    setHoueTwoUploaded(true);
                    setHoueTwoUploadedID(responseData);
                } else if (fileName === 'AddressProof.png') {
                    setAddressProofUploaded(true);
                    setAddressProofUploadedID(responseData);
                }
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



    const validateForm = () => {
        if (!houeOneUploadedID.trim()) return 'Image of House One is required';
        if (!houeTwoUploadedID.trim()) return 'Image of House Two is required';
        if (!addressProofUploadedID.trim()) return 'Image of Address Proof is required';

        return null;
    };


    const handleSaveAndNext = async () => {

        // Validation

        const validationError = validateForm();
        if (validationError) {
            Alert.alert('Validation Error', validationError);
            return;
        }




        navigation.replace('UploadSelfie', {

            candidateId: candidateId,
            latt: routLatt,
            lng: routeLng
        });



    };


    const deleteDoc = async (fileName, docID) => {

        // Validation


        try {
            const token = await AsyncStorage.getItem('access_token');
            console.log('token', token);
            console.log('candidateID', candidateId);
            console.log('feedbackId', feedbackId);
            console.log('docID', docID);



            if (!token) {
                Alert.alert('Error', 'User session expired. Please log in again.');
                return;
            }

            setLoading(true);


            // file is null → skip file append


            const url = `${API.DELETEDOC}?VerificationTypeId=${feedbackId}&FeedBackDocId=${docID}`;
            console.log('Delete API URL:', url);

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('API Response:', response.data);
            const { responseData, responseText, responseStatus } = response.data;

            if (responseStatus) {
                Alert.alert('Success', 'Document deleted successfully!');
                if (fileName === 'HouseImageOne.png') {
                    setHoueOneUploaded(false);
                    setHoueOneUploadedID('');
                    setHoueOnecapturedImage(null);
                } else if (fileName === 'HouseImageTwo.png') {
                    setHoueTwoUploaded(false);
                    setHoueTwoUploadedID('');
                    setHoueTwocapturedImage(null);
                } else if (fileName === 'AddressProof.png') {
                    setAddressProofUploaded(false);
                    setAddressProofUploadedID('');
                    setaddressProofcapturedImage(null);
                }
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
            <StatusBar backgroundColor="#006699" barStyle="light-content" translucent={false} />
            {loading && <Loader />}
            <View style={styles.container}>
                <View style={styles.toolBar}>
                    <Text style={styles.toolbarText}>
                        Verification Documents
                    </Text>
                </View>
                <Text style={styles.headerTitle}>Upload the following documents</Text>
                <ScrollView style={styles.mainContainer}>
                    <View style={styles.childraw}>
                        <View style={styles.raw}>

                            <Text style={styles.title}>House Image (1)</Text>
                        </View>
                        <View style={styles.inputBox}>
                            <TouchableOpacity style={[styles.uploadButton]} onPress={openCameraforHouseOne}>
                                <Text style={styles.detailsText}>Browse</Text>
                            </TouchableOpacity>

                            {houeOnecapturedImage && (
                                <>
                                    <Image
                                        source={houeOnecapturedImage}
                                        style={[styles.captureImage, { marginLeft: 10 }]}
                                    />
                                    {!houeOneUploaded ? (
                                        <TouchableOpacity
                                            style={{ alignItems: 'center', justifyContent: 'center', margin: 10 }}
                                            onPress={() =>
                                                docUpload(houeOnecapturedImage.uri, 'HouseImageOne.png')
                                            }
                                        >
                                            <Image
                                                source={require('../asset/upload.png')}
                                                style={[{ margin: 10, height: 40, width: 40 }]}
                                            />
                                            <Text style={{ fontSize: 12 }}>Upload</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            style={{ alignItems: 'center', justifyContent: 'center', margin: 10 }}

                                            onPress={() =>
                                                deleteDoc('HouseImageOne.png', houeOneUploadedID)
                                            }>
                                            <Image
                                                source={require('../asset/bin.png')}
                                                style={[{ margin: 10, height: 40, width: 40 }]}
                                            />
                                            <Text style={{ fontSize: 12 }}>Delete</Text>
                                        </TouchableOpacity>
                                    )}
                                </>
                            )}

                        </View>
                    </View>

                    <View style={styles.childraw}>
                        <View style={styles.raw}>

                            <Text style={styles.title}>House Image (2)</Text>
                        </View>
                        <View style={styles.inputBox}>
                            <TouchableOpacity style={[styles.uploadButton]} onPress={openCameraforHouseTwo}>
                                <Text style={styles.detailsText}>Browse</Text>
                            </TouchableOpacity>

                            {houeTwocapturedImage && (
                                <>

                                    <Image
                                        source={houeTwocapturedImage}/// Replace with your fingerprint icon
                                        style={[styles.captureImage, { marginLeft: 20 }]}
                                    />
                                    {!houeTwoUploaded ? (
                                        <TouchableOpacity
                                            style={{ alignItems: 'center', justifyContent: 'center', margin: 10 }}
                                            onPress={() =>
                                                docUpload(houeTwocapturedImage.uri, 'HouseImageTwo.png')
                                            }
                                        >
                                            <Image
                                                source={require('../asset/upload.png')}
                                                style={[{ margin: 10, height: 40, width: 40 }]}
                                            />
                                            <Text style={{ fontSize: 12 }}>Upload</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            style={{ alignItems: 'center', justifyContent: 'center', margin: 10 }}

                                            onPress={() =>
                                                deleteDoc('HouseImageTwo.png', houeTwoUploadedID)
                                            }>
                                            <Image
                                                source={require('../asset/bin.png')}
                                                style={[{ margin: 10, height: 40, width: 40 }]}
                                            />
                                            <Text style={{ fontSize: 12 }}>Delete</Text>
                                        </TouchableOpacity>
                                    )}
                                </>
                            )}

                        </View>
                    </View>


                    <View style={styles.childraw}>
                        <View style={styles.raw}>

                            <Text style={styles.title}>Candidate's Address Proof</Text>
                        </View>
                        <View style={styles.inputBox}>
                            <TouchableOpacity style={[styles.uploadButton]} onPress={openCameraforAddressProof}>
                                <Text style={styles.detailsText}>Browse</Text>
                            </TouchableOpacity>
                            {addressProofcapturedImage && (
                                <>
                                    <Image
                                        source={addressProofcapturedImage}/// Replace with your fingerprint icon
                                        style={[styles.captureImage, { marginLeft: 20 }]}
                                    />

                                    {!addressProofUploaded ? (
                                        <TouchableOpacity
                                            style={{ alignItems: 'center', justifyContent: 'center', margin: 10 }}
                                            onPress={() =>
                                                docUpload(addressProofcapturedImage.uri, 'AddressProof.png')
                                            }
                                        >
                                            <Image
                                                source={require('../asset/upload.png')}
                                                style={[{ margin: 10, height: 40, width: 40 }]}
                                            />
                                            <Text style={{ fontSize: 12 }}>Upload</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            style={{ alignItems: 'center', justifyContent: 'center', margin: 10 }}

                                            onPress={() =>
                                                deleteDoc('AddressProof.png', addressProofUploadedID)
                                            }>
                                            <Image
                                                source={require('../asset/bin.png')}
                                                style={[{ margin: 10, height: 40, width: 40 }]}
                                            />
                                            <Text style={{ fontSize: 12 }}>Delete</Text>
                                        </TouchableOpacity>
                                    )}
                                </>
                            )}

                        </View>
                    </View>


                    <TouchableOpacity style={styles.detailsButton} onPress={handleSaveAndNext}>
                        <Text style={styles.detailsText}>Save & Next</Text>
                    </TouchableOpacity>

                    <View style={{ height: 40 }}></View>





                </ScrollView>




            </View>
        </SafeAreaView>

    );
};

export default VerfifcationDocument;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    toolBar: {
        height: 60,
        width: '100%',
        backgroundColor: '#006699',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40
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
        height: 100,
        flexDirection: 'row'
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
        width: 100,
        marginHorizontal: 10,
        marginVertical: 10
    },

    captureImage: {
        width: 80,
        height: 80,
        margin: 10,
    },

    uploadButton: {
        backgroundColor: "#EE1171",
        paddingVertical: 6,
        paddingHorizontal: 12,
        height: 50,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
        marginHorizontal: 10,
        marginVertical: 10
    },


});
