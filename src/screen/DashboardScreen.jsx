import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
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
    Alert,
    PermissionsAndroid,

} from 'react-native';
import API from '../utility/API';
import { Loader } from '../utility/Loader';
import axios from 'axios';
import Geocoder from 'react-native-geocoding';
import Geolocation from '@react-native-community/geolocation';


const DashboardScreen = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [verificationModalVisible, setVerificationModalVisible] = useState(false);
    const [name, setName] = useState('');
    const [profilePic, setProfilePic] = useState(null);
    const [caseList, setCaseList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [caseDetails, setCaseDetails] = useState(null);
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState('Fetching address......');
    const defaultLat = 10.10;
    const defaultLng = 10.10;
    const [searchText, setSearchText] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);

    const [coords, setCoords] = useState({
        latitude: defaultLat,
        longitude: defaultLng,
    });

    const navigation = useNavigation()

    useEffect(() => {
        const loadData = async () => {
            try {
                const storedUserName = await AsyncStorage.getItem('FullName');
                const storedPic = await AsyncStorage.getItem('ProfilePicture');
                setName(storedUserName);

                if (storedPic) {
                    // Replace backslashes in the URL
                    const cleanUrl = storedPic.replace(/\\/g, '/');
                    setProfilePic(cleanUrl);
                }







            } catch (error) {
                console.error('Error loading stored data:', error);
            }
        };

        loadData();
        fetchCases();
    }, []);


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
                        timeout: 10000,
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

    const fetchCases = async () => {
        try {
            setLoading(true);

            // Get vendor ID or token from AsyncStorage
            const id = await AsyncStorage.getItem('responseText');

            // Make API call using the common API class
            const response = await axios.get(API.CASE_LIST(id));
            const res = response.data;
            console.log('Case List:', res);

            if (res.responseStatus && Array.isArray(res.responseData)) {
                const formatted = res.responseData.map((item, index) => ({
                    id: index.toString(),
                    name: item.Candidate?.FULLNAME || 'Unknown',
                    contact: item.Candidate?.MobileNumber || 'N/A',
                    company: item.Candidate?.CompanyId || 'N/A',
                    SecureID: item.Candidate?.SecureID || 'N/A',
                    assignedDate: item.Assign?.AssignedOn || 'N/A',
                    address: item.Address?.AddressLine1 || '',
                    CandidateID: item.Candidate?.CandidateID || 'N/A',
                }));

                setCaseList(formatted);
            } else {
                Alert.alert('No details found');
            }
        } catch (error) {
            console.error('Error fetching cases:', error);
        } finally {
            // setLoading(false);
        }
    };


    const fetchCaseDetails = async (secureId) => {
        try {
            setModalVisible(false);
            setLoading(true);
            const response = await axios.get(API.CASE_DETAILS(secureId));
            const res = response.data;

            if (res.responseStatus && res.responseData.length > 0) {
                setCaseDetails(res.responseData[0]);
                setModalVisible(true);
            } else {
                Alert.alert('No details found for this case.');
            }
        } catch (error) {
            console.error('Error fetching case details:', error);
            Alert.alert('Failed to fetch case details.');
        } finally {
            setLoading(false);
        }
    };


    const addressNotification = async (secureId) => {
        try {
            setModalVisible(false);
            setLoading(true);

            const response = await axios.get(API.NOTIFICATION_ADDRESS(secureId));
            const res = response.data;

            if (res.responseStatus) {
                Alert.alert('Resquest has been sent successfully');
            } else {
                Alert.alert('No details found for this case.');
            }
        } catch (error) {
            console.error('Error fetching case details:', error);
            Alert.alert('Failed to fetch case details.');
        } finally {
            setLoading(false);
        }
    };


    const sendLocationData = async (candidateID, candidateName, address, contactNumber, lat, lng) => {
        setLoading(true);
        setVerificationModalVisible(false);

        if (!coords) {
            console.log('Coordinates not available yet');
            setLoading(false);
            Alert.alert('Coordinates not available yet')
            return;
        }

        const id = await AsyncStorage.getItem('UserId');
        console.log('id', id);
        console.log('CandidateId', candidateID);

        const url = API.STARTVERFICATION;
        console.log('url', url);

        const formData = new FormData();
        formData.append('CandidateId', candidateID);
        formData.append('UserId', id.toString());
        formData.append('Lat', coords.latitude.toString());
        formData.append('Lng', coords.longitude.toString());

        try {
            const response = await axios.post(url, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            console.log('📡 API Response:', response.data);
            setLoading(false);

            if (response.data.responseStatus === true) {
                navigation.navigate('VerificationForm', {
                    candidateId: candidateID,
                    candidateName: candidateName,
                    address: address,
                    contactNumber: contactNumber,
                    latt: lat,
                    lng: lng
                });
                console.log('✅ Success! Data saved.');
            } else {
                console.log('❌ Failed:', response.data);
                Alert.alert('Failed', 'Unable to start verification.');
            }
        } catch (error) {
            setLoading(false);
            console.error('Error sending data:', error);
            Alert.alert('Network Error', 'Unable to connect to server.');
        } finally {
            setLoading(false);
        }
    };




    const openMap = (lat, lng, label) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        Linking.openURL(url).catch((err) => console.error("Error opening map", err));
    };

    const openDialPad = (phoneNumber) => {
        let number = `tel:${phoneNumber}`;
        Linking.openURL(number).catch((err) =>
            Alert.alert("Error", "Could not open dialer")
        );
    };

    const renderItem = ({ item, index }) => (
        <View style={[
            styles.card,
            { backgroundColor: index % 2 === 0 ? "#fff" : "#fcfcffff" }, // alternate bg
        ]}>
            <View style={{ backgroundColor: '#0d036bff', borderTopLeftRadius: 12, borderTopRightRadius: 12, paddingVertical: 10, paddingHorizontal: 5, marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Image source={require('../asset/clock-icon.png')} style={styles.clockicon}></Image>
                    <Text style={styles.date}>{item.assignedDate}</Text>
                </View>
                <Text style={[styles.name, { color: '#FFFFFF', marginVertical: 5 }]}>{item.company}</Text>

            </View>
            {/* Candidate Details */}

            <View style={{ padding: 10 }}>
                <View style={styles.addressRow}>
                    <Image source={require('../asset/profile.png')} style={styles.rawicon}></Image>
                    <Text style={styles.contact}>{item.name}</Text>
                </View>

                <TouchableOpacity onPress={() => openDialPad(item.contact)} style={styles.addressRow}>
                    <Image source={require('../asset/telephone.png')} style={styles.rawicon}></Image>
                    <Text style={styles.contact}>{item.contact}</Text>
                </TouchableOpacity>

                <View style={styles.addressRow}>
                    <Image source={require('../asset/google-maps.png')} style={styles.rawicon}></Image>
                    <Text style={[styles.contact, { width: "95%" }]}>{item.address}</Text>
                </View>





                {/* Buttons */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.detailsButton} onPress={() => fetchCaseDetails(item.SecureID)}>
                        <Text style={styles.detailsText}>View Details</Text>
                    </TouchableOpacity>


                </View>
            </View>





        </View>
    );


    const filteredList = caseList.filter((item) =>
        item.name?.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#E8151582' }}>
            <View style={styles.container}>
                {loading && <Loader />}
                {/* Header with ImageBackground */}
                <ImageBackground
                    source={require('../asset/app-bg.png')} // 🔹 your gradient background image
                    style={styles.header}
                    resizeMode="cover"

                >


                    <View >
                        <Text style={styles.welcome}>Welcome</Text>
                        <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'space-between' }}>
                            <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between', right: 40 }}  onPress={() => setMenuVisible(true)}>
                                <Image source={require('../asset/side-navigation-icon.png')} style={{ width: 40, height: 40, marginRight: 25 }}></Image>
                                {profilePic ? (
                                    <Image
                                        source={{ uri: profilePic }}
                                        style={{ width: 50, height: 50, borderRadius: 25 }}
                                    />
                                ) : (
                                    <Image
                                        source={require('../asset/user-image.png')}
                                        style={{ width: 50, height: 50, borderRadius: 25 }}
                                    />
                                )}
                            </TouchableOpacity>


                            <Text style={styles.userName}>{name}</Text>
                        </View>

                    </View>



                    <View style={styles.form}>
                        <View style={styles.searchContainer}>
                            <Image source={require('../asset/search-icon.png')} style={styles.searchIcon}></Image>
                            <TextInput style={styles.searchInput} placeholder="Search by candidate name"
                                value={searchText}
                                onChangeText={(text) => setSearchText(text)} />
                        </View>

                        <FlatList
                            data={filteredList}
                            keyExtractor={(item) => item.id}
                            renderItem={renderItem}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    </View>


                    <Modal visible={modalVisible} transparent animationType="fade">
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContainer}>
                                <TouchableOpacity
                                    onPress={() => setModalVisible(false)}
                                    style={styles.closeButton}>
                                    <View style={styles.closeCircle}>
                                        <Image
                                            source={require('../asset/cross.png')}
                                            style={styles.closeicon}
                                        />
                                    </View>
                                </TouchableOpacity>




                                <View style={styles.popupheader}>
                                    <Text style={styles.headerTitle}>Verification Details</Text>
                                    <TouchableOpacity style={styles.addrequestButton}
                                        onPress={() => fetchCaseDetails(caseDetails?.Candidate?.SecureID)}>
                                        <Text style={{ fontSize: 12, color: '#FFF' }}>Refresh</Text>
                                        <Image
                                            source={require('../asset/refresh.png')}
                                            style={{ height: 15, width: 15, tintColor: '#FFF', marginLeft: 5 }}
                                        />
                                    </TouchableOpacity>

                                </View>

                                <View style={{ flex: 1, paddingHorizontal: 10 }}>
                                    <View style={{ marginVertical: 5 }}>
                                        <Text style={styles.userNameTitle}>Candidate Name</Text>
                                        <Text style={styles.valuePopup}>{caseDetails?.Candidate?.FULLNAME || 'N/A'}</Text>
                                    </View>

                                    <TouchableOpacity style={{ marginVertical: 10 }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={styles.userNameTitle}>Contact Number</Text>
                                        </View>

                                        <Text style={styles.valuePopup}>{caseDetails?.Candidate?.MobileNumber || 'N/A'}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={{ marginVertical: 10 }}>
                                        <Text style={styles.userNameTitle}>Alternative Number</Text>
                                        <Text style={styles.valuePopup}>{caseDetails?.Address?.AltPhone || 'N/A'}</Text>
                                    </TouchableOpacity>

                                    <View style={{ marginVertical: 10 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                                            <Text style={styles.userNameTitle}>Address</Text>

                                            {caseDetails?.AddressConfirmation?.IsVerifiedByCandidate ? (
                                                // ✅ Show View on Map if verified
                                                <TouchableOpacity
                                                    onPress={() =>
                                                        openMap(
                                                            caseDetails?.AddressConfirmation?.Latitude,
                                                            caseDetails?.AddressConfirmation?.Longitude
                                                        )
                                                    }
                                                    style={styles.viewMapButton}
                                                >
                                                    <Text style={styles.userNameTitle}>View on Map</Text>
                                                    <Image
                                                        source={require('../asset/google-maps.png')}
                                                        style={{ height: 15, width: 15, marginLeft: 5 }}
                                                    />
                                                </TouchableOpacity>
                                            ) : (
                                                // ❌ Show Send Address Request if not verified
                                                <TouchableOpacity
                                                    onPress={() => addressNotification(caseDetails?.Candidate?.SecureID)}
                                                    style={styles.addrequestButton}
                                                >
                                                    <Text style={[styles.userNameTitle, { color: '#fff' }]}>
                                                        Request for GPS Coordinates
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>

                                        <Text style={styles.valuePopup}>
                                            {caseDetails?.Address?.AddressLine1 || 'N/A'}
                                        </Text>
                                    </View>

                                    <View style={{ marginVertical: 10 }}>
                                        <Text style={styles.userNameTitle}>Father's Name</Text>
                                        <Text style={styles.valuePopup}>{caseDetails?.Candidate?.FatherName || 'N/A'}</Text>
                                    </View>


                                    <View style={{ marginVertical: 10 }}>
                                        <Text style={styles.userNameTitle}>Company Details</Text>
                                        <Text style={styles.valuePopup}>{caseDetails?.Candidate?.CompanyId || 'N/A'}</Text>
                                    </View>


                                    <View style={{ marginVertical: 10 }}>
                                        <Text style={styles.userNameTitle}>Assigned Date</Text>
                                        <Text style={styles.valuePopup}>{caseDetails?.Assign?.AssignedOn || 'N/A'}</Text>
                                    </View>


                                    {/* <View style={{ marginVertical: 10 }}>
                                        <Text style={styles.userNameTitle}>Deadline</Text>
                                        <Text style={styles.valuePopup}>31 Aug, 2025</Text>
                                    </View> */}




                                    <TouchableOpacity style={[{ width: '100%' }, styles.continueButton]} onPress={() => {
                                        setModalVisible(false);
                                        setVerificationModalVisible(true);
                                    }}>
                                        <Text style={styles.continueText}>Continue</Text>
                                    </TouchableOpacity>



                                </View>







                            </View>
                        </View>
                    </Modal>

                    <Modal visible={verificationModalVisible} transparent animationType="fade">
                        <View style={styles.modalOverlay}>
                            <View style={[styles.modalContainer, { alignItems: 'center' }]}>
                                <TouchableOpacity
                                    onPress={() => setVerificationModalVisible(false)}
                                    style={styles.closeButton}>
                                    <View style={styles.closeCircle}>
                                        <Image
                                            source={require('../asset/cross.png')}
                                            style={styles.closeicon}
                                        />
                                    </View>
                                </TouchableOpacity>

                                <Image
                                    source={require('../asset/verificationprocess-icon.png')}
                                    style={styles.verificationProcess}
                                />
                                <Text style={styles.verificationProcessText}>
                                    Verification Process
                                </Text>
                                <View style={styles.verificationStepRaw}>

                                    <View style={styles.roundCircle}>
                                        <Image
                                            source={require('../asset/from-icon.png')}

                                        />
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.verificationStepText}>
                                            First, fills out the verification form
                                        </Text>
                                    </View>


                                </View>

                                <View style={styles.verificationStepRaw}>
                                    <View style={styles.roundCircle}>
                                        <Image
                                            source={require('../asset/document-icon.png')}

                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.verificationStepText}>
                                            Second, uploads supporting documents
                                        </Text>
                                    </View>

                                </View>

                                <View style={styles.verificationStepRaw}>
                                    <View style={styles.roundCircle}>
                                        <Image
                                            source={require('../asset/selfie-icon.png')}

                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.verificationStepText}>
                                            Third, captures a selfie
                                        </Text>
                                    </View>

                                </View>


                                <TouchableOpacity style={[{ width: '80%' }, styles.continueButton]} onPress={() => {



                                    sendLocationData(caseDetails?.Candidate?.CandidateID, caseDetails?.Candidate?.FULLNAME, caseDetails?.Address?.AddressLine1, caseDetails?.Candidate?.MobileNumber, caseDetails?.AddressConfirmation?.Latitude,
                                        caseDetails?.AddressConfirmation?.Longitude)
                                }}>
                                    <Text style={styles.continueText}>Start Verification</Text>
                                </TouchableOpacity>














                            </View>
                        </View>
                    </Modal>


                    <Modal visible={menuVisible} transparent animationType="slide">
                        <TouchableOpacity
                            style={styles.sideMenuOverlay}
                            activeOpacity={1}
                            onPressOut={() => setMenuVisible(false)}
                        >
                            <View style={styles.sideMenuContainer}>
                                <View style={styles.sideMenuHeader}>
                                    {profilePic ? (
                                        <Image source={{ uri: profilePic }} style={styles.sideMenuProfilePic} />
                                    ) : (
                                        <Image source={require('../asset/user-image.png')} style={styles.sideMenuProfilePic} />
                                    )}
                                    <Text style={styles.sideMenuUserName}>{name}</Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.sideMenuItem}
                                    onPress={async () => {
                                        setMenuVisible(false);
                                        await AsyncStorage.clear();
                                        navigation.replace('MobileLogin'); // ✅ Replace with your actual login screen name
                                    }}
                                >
                                    <Image source={require('../asset/logout-icon.png')} style={styles.sideMenuIcon} />
                                    <Text style={styles.sideMenuText}>Logout</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </Modal>




                </ImageBackground>

                {/* Form Section */}

            </View>
        </SafeAreaView>

    );
};

export default DashboardScreen;

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        height: '100%',
        alignItems: 'center',

        paddingTop: 30,
        overflow: 'hidden',
        width: '100%',

    },

    headersection: {
        // gradient start
        padding: 20,
        paddingTop: 50,
    },
    welcome: {
        color: "#EDB232",
        fontFamily: "Jua",      // Make sure Jua font is linked/loaded
        fontWeight: "400",      // or "normal" since Jua might only support one weight
        fontStyle: "normal",    // "italic" if needed
        fontSize: 24,
        lineHeight: 24,         // 100% of fontSize
        letterSpacing: 0,
        textAlign: 'center'
    },
    userName: {
        color: "#fff",
        fontFamily: "Inter",     // Ensure Inter is properly linked/loaded
        fontWeight: "500",       // Medium weight
        fontStyle: "normal",     // React Native uses "normal" or "italic"
        fontSize: 18,
        lineHeight: 18,          // 100% of fontSize
        letterSpacing: 0,
        alignSelf: 'center',
        textAlign: 'center',
        right: 35

    },
    searchContainer: {
        flexDirection: "row",
        backgroundColor: "#fff",
        margin: 15,
        borderRadius: 8,
        alignItems: "center",
        paddingHorizontal: 10,
        elevation: 4,
        borderWidth: 1,
        borderColor: "#d8d8d878",
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        height: 40,
    },
    card: {
        backgroundColor: "#fff",
        marginHorizontal: 15,
        marginVertical: 8,
        borderRadius: 12,

        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        borderWidth: 1,
        borderColor: '#e1ddffff'
    },
    name: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#0d036bff",
    },

    date: {
        fontSize: 12,
        fontWeight: "300",
        color: "#ffffffff",
    },
    contact: {
        fontSize: 14,
        color: "#555",
        marginVertical: 4,
    },
    addressRow: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 6
    },
    address: {
        fontSize: 14,
        color: "#666",
        marginLeft: 5,
    },
    footer: {
        flexDirection: "row",
        marginTop: 12,
        justifyContent: "space-between",
        alignItems: "center",
        justifyContent: 'flex-end'
    },
    detailsButton: {
        backgroundColor: "#006699",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
    },
    detailsText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },
    statusBadge: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    statusText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 12,
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
        flex: 1


    },
    searchIcon: {
        height: 20,
        width: 20
    },
    clockicon: {
        height: 14,
        width: 14,
        marginRight: 5,
        tintColor: '#FFFFFF'
    },

    rawicon: {
        height: 25,
        width: 25,
        marginRight: 5

    },
    modalOverlay: {
        flex: 1,
        backgroundColor: '#00000040',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 50,
    },
    modalContainer: {
        height: '88%',
        backgroundColor: '#fff',
        borderRadius: 30,
        width: '92%',

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.07, // 7% opacity
        shadowRadius: 18.5, // Half of 37px for similar blur effect
        elevation: 3,
        borderWidth: 1,
        borderColor: '#00000012'
    },
    closeButton: {
        position: 'absolute',
        top: -20,
        alignSelf: 'center',
    },
    closeCircle: {
        width: 40,
        height: 40,
        borderRadius: '50%',
        backgroundColor: '#212121',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4, // Android only
    },

    headerTitle: {
        fontFamily: 'OpenSans-SemiBold', // Assuming you have the semi-bold variant of Open Sans
        fontWeight: '600', // Or 'bold' depending on platform/font setup
        fontSize: 20,
        lineHeight: 20, // 100% of 20px; consider increasing for better readability
        letterSpacing: 0,
        marginRight: 10,
        color: '#212121',

    },
    closeicon: {
        height: 20,
        width: 20,
        tintColor: '#fff',
    },
    popupheader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 30,
        height: 46,
        paddingHorizontal: 20,
        backgroundColor: '#ECF7FF',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    userNameTitle: {
        color: "#000000ff",
        fontFamily: "Inter",     // Ensure Inter is properly linked/loaded
        fontWeight: "400",       // Medium weight
        fontStyle: "normal",     // React Native uses "normal" or "italic"
        fontSize: 14,
        lineHeight: 18,          // 100% of fontSize
        letterSpacing: 0,


    },

    valuePopup: {
        color: "#1f012cff",
        fontFamily: "Inter",     // Ensure Inter is properly linked/loaded
        fontWeight: "700",       // Medium weight
        fontStyle: "normal",     // React Native uses "normal" or "italic"
        fontSize: 16,
        lineHeight: 18,          // 100% of fontSize
        letterSpacing: 0,
        marginTop: 5


    },

    popupDocument: {
        height: 80,
        width: 80,
        marginRight: 10
    },
    continueButton: {

        height: 40,
        borderRadius: 8,
        backgroundColor: '#006699',
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    continueText: {
        color: "#ffffffff",
        fontFamily: "Inter",     // Ensure Inter is properly linked/loaded
        fontWeight: "700",       // Medium weight
        fontStyle: "normal",     // React Native uses "normal" or "italic"
        fontSize: 16,
        lineHeight: 18,          // 100% of fontSize
        letterSpacing: 1,


    },

    verificationProcess: {
        height: 250,
        width: 250,
        marginTop: 30,


    },

    verificationProcessText: {
        color: "#6B6A6A",
        fontFamily: "Inter",     // Ensure Inter is properly linked/loaded
        fontWeight: "700",       // Medium weight
        fontStyle: "normal",     // React Native uses "normal" or "italic"
        fontSize: 20,
        lineHeight: 18,          // 100% of fontSize
        letterSpacing: 1,


    },
    roundCircle: {
        backgroundColor: '#EE11716B',
        borderRadius: 100,
        width: 45,
        height: 45,
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center'
    },
    verificationStepText: {
        fontSize: 14,
        color: '#6B6A6A',
        fontWeight: '500',
        fontFamily: 'italic',
        marginLeft: 10
    },
    verificationStepRaw: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 30,
        marginVertical: 20,
        justifyContent: 'center'
    },
    addrequestButton: {
        flexDirection: 'row',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#b6afafff',
        paddingVertical: 5,
        paddingHorizontal: 10,
        alignItems: 'center',
        backgroundColor: '#006699',
    },
    viewMapButton: {
        flexDirection: 'row',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#b6afafff',
        paddingVertical: 3,
        paddingHorizontal: 5,
        alignItems: 'center',
    },
    sideMenuOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    sideMenuContainer: {
        width: '70%',
        backgroundColor: '#fff',
        height: '100%',
        paddingTop: 50,
        paddingHorizontal: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 8,
    },
    sideMenuHeader: {
        alignItems: 'center',
        marginBottom: 40,
    },
    sideMenuProfilePic: {
        width: 70,
        height: 70,
        borderRadius: 35,
        marginBottom: 10,
    },
    sideMenuUserName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    sideMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 15,
    },
    sideMenuIcon: {
        width: 24,
        height: 24,
        marginRight: 15,
        tintColor: '#006699',
    },
    sideMenuText: {
        fontSize: 16,
        color: '#006699',
        fontWeight: '600',
    },




});
