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

} from 'react-native';


const MobileLogin = () => {

    const navigation = useNavigation()

    return (
        <View style={styles.container}>
            {/* Header with ImageBackground */}
            <ImageBackground
                source={require('../asset/FELogin.png')} // 🔹 your gradient background image
                style={styles.header}
                resizeMode="cover"

            >
                <View style={{flex:1}}></View>

                <View style={styles.form}>
                    <Text style={styles.loginText}>Login with your mobile no.</Text>
                    <View style={{flexDirection:'row',alignContent:'center',alignItems:'center'}}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.countryCode}>+91</Text>
                        </View>
                         <View style={[styles.inputContainer,{flex:1,marginLeft:10}]}>
                            <TextInput
                            style={styles.input}
                            placeholder="Enter mobile no."
                            placeholderTextColor="#888"
                            keyboardType="phone-pad"
                           
                        />
                         </View>
                        
                       
                    </View>

                    <TouchableOpacity style={styles.button}>
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
        borderTopRightRadius:50,
        marginTop: 30,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5,
        flex:0.35
      
        
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#00000078",
        borderRadius: 4,
        marginBottom: 15,
        paddingHorizontal: 10,
        height:50,
       
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
        width:200,
        alignSelf:'center',
        marginTop:20
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    loginText:{
        textAlign:'center',
        color:'#525B69',
        fontSize:21,
        fontWeight:'500',
        marginBottom:30
    }

});
