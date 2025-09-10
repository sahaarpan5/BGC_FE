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
    SafeAreaView,
    FlatList,
    Linking,
    Modal,
    ScrollView,

} from 'react-native';


const VerificationForm = () => {
    const navigation=useNavigation();


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#006699' }}>
            <View style={styles.container}>
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
                            <TextInput style={styles.inputText} ></TextInput>
                        </View>
                    </View>

                    <View style={styles.childraw}>
                        <View style={styles.raw}>

                            <Text style={styles.title}>Full Address</Text>
                        </View>
                        <View style={[styles.inputBox, { height: 100 }]}>
                            <TextInput style={styles.inputText} ></TextInput>
                        </View>
                    </View>

                    <View style={styles.childraw}>
                        <View style={styles.raw}>

                            <Text style={styles.title}>Address Type</Text>
                        </View>
                        <TouchableOpacity style={[styles.inputBox]}>
                            <Text style={[styles.inputText, { padding: 10 }]} >Please Select</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.childraw}>
                        <View style={styles.raw}>

                            <Text style={styles.title}>Type of Residence</Text>
                        </View>
                        <TouchableOpacity style={[styles.inputBox]}>
                            <Text style={[styles.inputText, { padding: 10 }]} >Please Select</Text>
                        </TouchableOpacity>
                    </View>


                    <View style={styles.childraw}>
                        <View style={styles.raw}>

                            <Text style={styles.title}>Period of Stay</Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.title}>Form</Text>
                                <TouchableOpacity style={[styles.inputBox,{marginTop:5}]}>
                                    <Text style={[styles.inputText, { padding: 10 }]} >Please Select</Text>
                                </TouchableOpacity>
                            </View>

                             <View style={{ flex: 1,marginLeft:10 }}>
                                <Text style={styles.title}>To</Text>
                                <TouchableOpacity style={[styles.inputBox,{marginTop:5}]}>
                                    <Text style={[styles.inputText, { padding: 10 }]} >Please Select</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                    </View>


                     <View style={styles.childraw}>
                        <View style={styles.raw}>

                            <Text style={styles.title}>Police Station</Text>
                        </View>
                        <View style={styles.inputBox}>
                            <TextInput style={styles.inputText} ></TextInput>
                        </View>
                    </View>

                     <View style={styles.childraw}>
                        <View style={styles.raw}>

                            <Text style={styles.title}>Candidate Contact Number</Text>
                        </View>
                        <View style={styles.inputBox}>
                            <TextInput style={styles.inputText} ></TextInput>
                        </View>
                    </View>


                     <View style={styles.childraw}>
                        <View style={styles.raw}>

                            <Text style={styles.title}>Verifier Name</Text>
                        </View>
                        <View style={styles.inputBox}>
                            <TextInput style={styles.inputText} ></TextInput>
                        </View>
                    </View>


                     <View style={styles.childraw}>
                        <View style={styles.raw}>

                            <Text style={styles.title}>Verifier Address</Text>
                        </View>
                        <View style={[styles.inputBox, { height: 100 }]}>
                            <TextInput style={styles.inputText} ></TextInput>
                        </View>
                    </View>

                     <View style={styles.childraw}>
                        <View style={styles.raw}>

                            <Text style={styles.title}>Verifier Contact Number</Text>
                        </View>
                        <View style={styles.inputBox}>
                            <TextInput style={styles.inputText} ></TextInput>
                        </View>
                    </View>

                    <View style={styles.childraw}>
                        <View style={styles.raw}>

                            <Text style={styles.title}>Relationship With Candidate</Text>
                        </View>
                        <View style={styles.inputBox}>
                            <TextInput style={styles.inputText} ></TextInput>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.detailsButton} onPress={() => navigation.replace('VerfifcationDocument')}>
                        <Text style={styles.detailsText}>Save & Next</Text>
                    </TouchableOpacity>

                    <View style={{height:40}}></View>

                    



                </ScrollView>




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
        height:50,
        borderRadius: 4,
        marginTop:20,
        justifyContent:'center'
    },
    detailsText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
        letterSpacing:1,
        textAlign:'center'
    },


});
