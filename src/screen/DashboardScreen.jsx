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

} from 'react-native';
import API from '../utility/API';
import { Loader } from '../utility/Loader';
import axios from 'axios';


const DashboardScreen = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [verificationModalVisible, setVerificationModalVisible] = useState(false);
    const [name, setName] = useState('');
    const [profilePic, setProfilePic] = useState(null);
    const [caseList, setCaseList] = useState([]);
    const [loading, setLoading] = useState(false);

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
                    assignedDate: item.Assign?.AssignedOn || 'N/A',
                    address: item.Address?.AddressLine1 || '',
                }));

                setCaseList(formatted);
            }
        } catch (error) {
            console.error('Error fetching cases:', error);
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




                {/* Buttons */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.detailsButton} onPress={() => setModalVisible(true)}>
                        <Text style={styles.detailsText}>View Details</Text>
                    </TouchableOpacity>


                </View>
            </View>





        </View>
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
                            <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between', right: 40 }}>
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
                            <TextInput style={styles.searchInput} placeholder="Search by text" />
                        </View>

                        <FlatList
                            data={caseList}
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

                                </View>

                                <View style={{ flex: 1, paddingHorizontal: 10 }}>
                                    <View style={{ marginVertical: 5 }}>
                                        <Text style={styles.userNameTitle}>Candidate Name</Text>
                                        <Text style={styles.valuePopup}>Arpan Saha</Text>
                                    </View>

                                    <TouchableOpacity style={{ marginVertical: 10 }}>
                                        <Text style={styles.userNameTitle}>Candidate Contact Number</Text>
                                        <Text style={styles.valuePopup}>9804043285</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={{ marginVertical: 10 }}>
                                        <Text style={styles.userNameTitle}>Candidate Address</Text>
                                        <Text style={styles.valuePopup}>Sodepur,Sadhurmore</Text>
                                    </TouchableOpacity>


                                    <View style={{ marginVertical: 10 }}>
                                        <Text style={styles.userNameTitle}>Company Details</Text>
                                        <Text style={styles.valuePopup}>Fedbank Ltd.</Text>
                                    </View>


                                    <View style={{ marginVertical: 10 }}>
                                        <Text style={styles.userNameTitle}>Assigned Date</Text>
                                        <Text style={styles.valuePopup}>20 Aug, 2025</Text>
                                    </View>


                                    <View style={{ marginVertical: 10 }}>
                                        <Text style={styles.userNameTitle}>Deadline</Text>
                                        <Text style={styles.valuePopup}>31 Aug, 2025</Text>
                                    </View>


                                    <View style={{ marginVertical: 10 }}>
                                        <Text style={styles.userNameTitle}>Documents</Text>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Image
                                                source={require('../asset/aadhar.png')}
                                                style={styles.popupDocument}
                                            />

                                            <Image
                                                source={require('../asset/Pan.png')}
                                                style={styles.popupDocument}
                                            />
                                        </View>
                                    </View>

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

                                    setVerificationModalVisible(false);
                                    navigation.navigate('VerificationForm');
                                }}>
                                    <Text style={styles.continueText}>Start Verification</Text>
                                </TouchableOpacity>














                            </View>
                        </View>
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
        height: '85%',
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
    }




});
