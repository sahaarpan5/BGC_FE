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

} from 'react-native';


const DashboardScreen = () => {

    const navigation = useNavigation()

    const data = [
        {
            id: "1",
            name: "Chandan Thakur",
            contact: "+91 9876543210",
            address: "Kolkata, West Bengal",
            status: "Ongoing",
            latitude: 19.076,
            longitude: 72.8777,
        },
        {
            id: "2",
            name: "Amit Sharma",
            contact: "+91 9123456789",
            address: "Delhi, India",
            status: "Hold",
            latitude: 19.076,
            longitude: 72.8777,
        },
        {
            id: "3",
            name: "Priya Verma",
            contact: "+91 9988776655",
            address: "Bangalore, Karnataka",
            status: "Pending",
            latitude: 19.076,
            longitude: 72.8777,
        },
        {
            id: "4",
            name: "Rahul Singh",
            contact: "+91 8877665544",
            address: "Mumbai, Maharashtra",
            status: "Done",
            latitude: 19.076,
            longitude: 72.8777,
        },
    ];

    const openMap = (lat, lng, label) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        Linking.openURL(url).catch((err) => console.error("Error opening map", err));
    };

    const renderItem = ({ item, index }) => (
        <View style={[
            styles.card,
            { backgroundColor: index % 2 === 0 ? "#fff" : "#f2f2f2" }, // alternate bg
        ]}>
            {/* Candidate Details */}
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.contact}>{item.contact}</Text>

            <TouchableOpacity style={styles.addressRow} onPress={() => openMap(item.latitude, item.longitude, item.address)}>
                {/* <Icon name="map-marker" size={18} color="#555" /> */}
                <Image source={require('../asset/google-maps.png')} ></Image>
                <Text style={styles.address}>{item.address}</Text>
            </TouchableOpacity>

            {/* Buttons */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.detailsButton}>
                    <Text style={styles.detailsText}>View Details</Text>
                </TouchableOpacity>


            </View>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#E8151582' }}>
            <View style={styles.container}>
                {/* Header with ImageBackground */}
                <ImageBackground
                    source={require('../asset/app-bg.png')} // 🔹 your gradient background image
                    style={styles.header}
                    resizeMode="cover"

                >
                   
                        
                        <View >
                            <Text style={styles.welcome}>Welcome</Text>
                            <View style={{ flexDirection: 'row',  marginTop: 10 ,justifyContent:'space-between'}}>
                                <TouchableOpacity style={{flexDirection:'row',justifyContent:'space-between',right:40}}>
                                    <Image source={require('../asset/side-navigation-icon.png')} style={{width:40,height:40,marginRight:25}}></Image>
                                    <Image source={require('../asset/user-image.png')} ></Image>
                                </TouchableOpacity>
                                
                                
                                <Text style={styles.userName}>Chandan Thakur</Text>
                            </View>

                        </View>
                    


                    <View style={styles.form}>
                        <View style={styles.searchContainer}>
                            <Image source={require('../asset/search-icon.png')} style={styles.searchIcon}></Image>
                            <TextInput style={styles.searchInput} placeholder="Search by text" />
                        </View>

                        <FlatList
                            data={data}
                            keyExtractor={(item) => item.id}
                            renderItem={renderItem}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    </View>




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
        textAlign:'center'
    },
    userName: {
        color: "#fff",
        fontFamily: "Inter",     // Ensure Inter is properly linked/loaded
        fontWeight: "500",       // Medium weight
        fontStyle: "normal",     // React Native uses "normal" or "italic"
        fontSize: 18,
        lineHeight: 18,          // 100% of fontSize
        letterSpacing: 0,
        alignSelf:'center',
        textAlign:'center',
        right:35

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
        borderRadius: 4,
        padding: 15,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    name: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    contact: {
        fontSize: 14,
        color: "#555",
        marginVertical: 4,
    },
    addressRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
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
    }


});
