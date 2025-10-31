import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
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
    Alert,
    Button,
    PanResponder,
    KeyboardAvoidingView,
    StatusBar,

} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API from '../utility/API';
import { Loader } from '../utility/Loader';




const VerificationForm = () => {
    const navigation = useNavigation();
    const [addressModalVisible, setAddressModalVisible] = useState(false);


    const [selectedAddressType, setSelectedAddressType] = useState("Please Select");

    const [residanceModalVisible, setResidanceModalVisible] = useState(false);
    const [selectedResidanceType, setSelectedResidanceType] = useState("Please Select");

    const [periodOfStay, setPeriodOfStay] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const [showPickerTo, setShowPickerTo] = useState(false);

    const [periodOfStayTo, setPeriodOfStayTo] = useState('');

    const [policeStation, setPoliceStation] = useState('');




    const [realtionShip, setRealtionShip] = useState('Self');
    const [loading, setLoading] = useState(false);

    const docType = 'Aadhar';
    const operation = '0';
    const longitude = 88.3639;
    const latitude = 22.5726;
    const ResidanceFeedbackId = '';
    const IDProofType_file_name = '';
    const verifiersignaturefile_name = '';
    const finalFile = null;

    const route = useRoute();
    const { candidateId, candidateName: routeCandidateName, address: routeAddress, contactNumber: routeContactNumber, latt: routLatt, lng: routeLng } = route.params || {};
    const [candidateName, setCandidateName] = useState(routeCandidateName || '');
    const [verifierName, setVerifierName] = useState(routeCandidateName || '');
    const [address, setAddress] = useState(routeAddress || '');
    const [verifierAddress, setVerifierAddress] = useState(routeAddress || '');
    const [canCont, setCanCont] = useState(routeContactNumber || '');
    const [verifierCont, setVerifierCont] = useState(routeContactNumber || '');
    console.log('laatitue', routLatt);
    console.log('Longitude', routeLng);


    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const handleDateChange = (event, selectedDate) => {
        setShowPicker(false);
        if (selectedDate) {
            setPeriodOfStay(formatDate(selectedDate));
        }
    };

    const handleDateChangeToDate = (event, selectedDate) => {
        setShowPickerTo(false);
        if (selectedDate) {
            setPeriodOfStayTo(formatDate(selectedDate));
        }
    };


    const validateForm = () => {
        if (!candidateName.trim()) return 'Candidate Name is required';
        if (!address.trim()) return 'Full Address is required';
        if (selectedAddressType === 'Please Select') return 'Address Type is required';
        if (selectedResidanceType === 'Please Select') return 'Type of Residence is required';
        if (!periodOfStay.trim()) return 'Period of Stay (From) is required';
        if (!periodOfStayTo.trim()) return 'Period of Stay (To) is required';
        if (!policeStation.trim()) return 'Police Station is required';
        if (!canCont.trim()) return 'Candidate Contact Number is required';
        if (!verifierName.trim()) return 'Verifier Name is required';
        if (!verifierAddress.trim()) return 'Verifier Address is required';
        if (!verifierCont.trim()) return 'Verifier Contact Number is required';
        if (!realtionShip.trim()) return 'Relationship With Candidate is required';
        return null;
    };

    const handleSaveAndNext = async () => {

        // Validation


        try {
            const token = await AsyncStorage.getItem('access_token');
            console.log('token', token);
            console.log('candidateID', candidateId);

            const validationError = validateForm();
            if (validationError) {
                Alert.alert('Validation Error', validationError);
                return;
            }


            if (!token) {
                Alert.alert('Error', 'User session expired. Please log in again.');
                return;
            }

            setLoading(true);

            const formData = new FormData();
            formData.append('Candidateid', candidateId);
            formData.append('candidatecontactno', canCont);
            formData.append('candidaterelationship', realtionShip);
            formData.append('periodofsaty_from', periodOfStay);
            formData.append('periodofsaty_to', periodOfStayTo);
            formData.append('address', address);
            formData.append('policestation', policeStation);
            formData.append('verifiername', verifierName);
            formData.append('verifieraddress', verifierAddress);
            formData.append('verifiercontactno', verifierCont);
            formData.append('IDProofType', docType);
            formData.append('CreatedBy', candidateId);
            formData.append('residencetype', selectedResidanceType);
            formData.append('flag', '2');
            formData.append('ResidanceFeedbackId', ResidanceFeedbackId);
            formData.append('IDProofType_file_name', IDProofType_file_name);
            formData.append('verifiersignaturefile_name', verifiersignaturefile_name);
            formData.append('address_type', selectedAddressType);
            formData.append('status', String(longitude));
            formData.append('comments', String(latitude));
            formData.append('operation', operation);

            // file is null → skip file append

            const response = await axios.post(API.FORMSUBMIT, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('API Response:', response.data);
            const { responseCode, responseData, responseStatus } = response.data;

            if (responseStatus) {
                const [feedbackId, autoInID] = responseData.split(',');
                await AsyncStorage.setItem('feedbackId', feedbackId);
                await AsyncStorage.setItem('autoInID', autoInID);
                Alert.alert('Success', 'Data saved successfully!');
                navigation.replace('VerfifcationDocument', {
                    feedbackId: feedbackId,
                    autoInID: autoInID,
                    candidateId: candidateId,
                    latt: routLatt,
                    lng: routeLng
                });
            } else {
                Alert.alert('Error', responseMessage || 'Something went wrong!');
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
            <View style={styles.container}>
                {loading && <Loader />}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <View style={{ flex: 1 }}>

                        <View style={styles.toolBar}>
                            <Text style={styles.toolbarText}>
                                Verification Form
                            </Text>
                        </View>
                        <Text style={styles.headerTitle}>Fill the following details</Text>
                        <ScrollView style={styles.mainContainer}>
                            <View style={styles.childraw}>
                                <View style={styles.raw}>

                                    <Text style={styles.title}>Candidate Name</Text>
                                </View>
                                <View style={styles.inputBox}>
                                    <TextInput style={styles.inputText}
                                        value={candidateName}
                                        onChangeText={setCandidateName}></TextInput>
                                </View>
                            </View>

                            <View style={styles.childraw}>
                                <View style={styles.raw}>

                                    <Text style={styles.title}>Full Address</Text>
                                </View>
                                <View style={[styles.inputBox, { height: 100 }]}>
                                    <TextInput
                                        style={styles.inputText}
                                        multiline
                                        value={address}
                                        onChangeText={setAddress}></TextInput>
                                </View>
                            </View>

                            <View style={styles.childraw}>
                                <View style={styles.raw}>

                                    <Text style={styles.title}>Address Type</Text>
                                </View>
                                <TouchableOpacity style={[styles.inputBox]} onPress={() => setAddressModalVisible(true)}>
                                    <Text style={[styles.inputText, { padding: 10 }]} >{selectedAddressType}</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.childraw}>
                                <View style={styles.raw}>

                                    <Text style={styles.title}>Type of Residence</Text>
                                </View>
                                <TouchableOpacity style={[styles.inputBox]} onPress={() => setResidanceModalVisible(true)}>
                                    <Text style={[styles.inputText, { padding: 10 }]} >{selectedResidanceType}</Text>
                                </TouchableOpacity>
                            </View>


                            <View style={styles.childraw}>
                                <View style={styles.raw}>

                                    <Text style={styles.title}>Period of Stay</Text>
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.title}>Form</Text>
                                        <TouchableOpacity style={[styles.inputBox, { marginTop: 5 }]} onPress={() => setShowPicker(true)}
                                            activeOpacity={0.7}>
                                            <Text style={[styles.inputText, { margin: 10 }]}>
                                                {periodOfStay || 'Select Date'}
                                            </Text>
                                        </TouchableOpacity>
                                        {showPicker && (
                                            <DateTimePicker
                                                value={new Date()}
                                                mode="date"
                                                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                                onChange={handleDateChange}
                                            />
                                        )}
                                    </View>

                                    <View style={{ flex: 1, marginLeft: 10 }}>
                                        <Text style={styles.title}>To</Text>
                                        <TouchableOpacity style={[styles.inputBox, { marginTop: 5 }]} onPress={() => setShowPickerTo(true)}
                                            activeOpacity={0.7}>
                                            <Text style={[styles.inputText, { padding: 10 }]} > {periodOfStayTo || 'Select Date'}</Text>
                                        </TouchableOpacity>

                                        {showPickerTo && (
                                            <DateTimePicker
                                                value={new Date()}
                                                mode="date"
                                                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                                onChange={handleDateChangeToDate}
                                            />
                                        )}
                                    </View>
                                </View>

                            </View>


                            <View style={styles.childraw}>
                                <View style={styles.raw}>

                                    <Text style={styles.title}>Police Station</Text>
                                </View>
                                <View style={styles.inputBox}>
                                    <TextInput style={styles.inputText}
                                        value={policeStation}
                                        onChangeText={setPoliceStation}></TextInput>
                                </View>
                            </View>

                            <View style={styles.childraw}>
                                <View style={styles.raw}>

                                    <Text style={styles.title}>Candidate Contact Number</Text>
                                </View>
                                <View style={styles.inputBox}>
                                    <TextInput style={styles.inputText}
                                        keyboardType="phone-pad"
                                        value={canCont}
                                        onChangeText={setCanCont}></TextInput>
                                </View>
                            </View>


                            <View style={styles.childraw}>
                                <View style={styles.raw}>

                                    <Text style={styles.title}>Verifier Name</Text>
                                </View>
                                <View style={styles.inputBox}>
                                    <TextInput style={styles.inputText}
                                        value={verifierName}
                                        onChangeText={setVerifierName}></TextInput>
                                </View>
                            </View>


                            <View style={styles.childraw}>
                                <View style={styles.raw}>

                                    <Text style={styles.title}>Verifier Address</Text>
                                </View>
                                <View style={[styles.inputBox, { height: 100 }]}>
                                    <TextInput style={styles.inputText}
                                        multiline
                                        value={verifierAddress}
                                        onChangeText={setVerifierAddress} ></TextInput>
                                </View>
                            </View>

                            <View style={styles.childraw}>
                                <View style={styles.raw}>

                                    <Text style={styles.title}>Verifier Contact Number</Text>
                                </View>
                                <View style={styles.inputBox}>
                                    <TextInput style={styles.inputText}
                                        keyboardType="phone-pad"
                                        value={verifierCont}
                                        onChangeText={setVerifierCont}></TextInput>
                                </View>
                            </View>

                            <View style={styles.childraw}>
                                <View style={styles.raw}>

                                    <Text style={styles.title}>Relationship With Candidate</Text>
                                </View>
                                <View style={styles.inputBox}>
                                    <TextInput style={styles.inputText}
                                        value={realtionShip}
                                        onChangeText={setRealtionShip}></TextInput>
                                </View>
                            </View>
                            {/* onPress={() => navigation.replace('VerfifcationDocument')} */}
                            <TouchableOpacity style={styles.detailsButton} onPress={handleSaveAndNext}>
                                <Text style={styles.detailsText}>Save & Next</Text>
                            </TouchableOpacity>

                            <View style={{ height: 40 }}></View>





                        </ScrollView>

                        <Modal
                            transparent={true}
                            visible={addressModalVisible}
                            animationType="fade"
                            onRequestClose={() => setAddressModalVisible(false)}
                        >
                            <View style={styles.modalOverlay}>
                                <View style={styles.modalContainer}>
                                    <Text style={styles.modalTitle}>Select Address Type</Text>

                                    <TouchableOpacity
                                        style={styles.modalOption}
                                        onPress={() => {
                                            setSelectedAddressType("Present Address");
                                            setAddressModalVisible(false);
                                        }}
                                    >
                                        <Text style={styles.modalOptionText}>Present Address</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.modalOption}
                                        onPress={() => {
                                            setSelectedAddressType("Permanent Address");
                                            setAddressModalVisible(false);
                                        }}
                                    >
                                        <Text style={styles.modalOptionText}>Permanent Address</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => setAddressModalVisible(false)}
                                        style={styles.modalCancel}
                                    >
                                        <Text style={styles.modalCancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>



                        <Modal
                            transparent={true}
                            visible={residanceModalVisible}
                            animationType="fade"
                            onRequestClose={() => setResidanceModalVisible(false)}
                        >
                            <View style={styles.modalOverlay}>
                                <View style={styles.modalContainer}>
                                    <Text style={styles.modalTitle}>Select Residance Type</Text>

                                    <TouchableOpacity
                                        style={styles.modalOption}
                                        onPress={() => {
                                            setSelectedResidanceType("Own");
                                            setResidanceModalVisible(false);
                                        }}
                                    >
                                        <Text style={styles.modalOptionText}>Own</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.modalOption}
                                        onPress={() => {
                                            setSelectedResidanceType("Rented");
                                            setResidanceModalVisible(false);
                                        }}
                                    >
                                        <Text style={styles.modalOptionText}>Rented</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.modalOption}
                                        onPress={() => {
                                            setSelectedResidanceType("PG");
                                            setResidanceModalVisible(false);
                                        }}
                                    >
                                        <Text style={styles.modalOptionText}>PG</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => setAddressModalVisible(false)}
                                        style={styles.modalCancel}
                                    >
                                        <Text style={styles.modalCancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>
                    </View>
                </KeyboardAvoidingView>







            </View>
        </SafeAreaView>

    );
};

export default VerificationForm;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    toolBar: {
        height: 60,
        width: '100%',
        backgroundColor: '#006699',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop:40
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
        height: 50
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingVertical: 20,
        paddingHorizontal: 15,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 15,
        color: '#000',
    },
    modalOption: {
        width: '100%',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#006699',
        textAlign: 'center',
    },
    modalCancel: {
        marginTop: 15,
        paddingVertical: 8,
        paddingHorizontal: 20,
        backgroundColor: '#006699',
        borderRadius: 5,
    },
    modalCancelText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    modalContainerforSign: { flex: 1, padding: 10 },
    signaturePad: { flex: 1, borderWidth: 1, borderColor: "#000" },
    buttonRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },




});
