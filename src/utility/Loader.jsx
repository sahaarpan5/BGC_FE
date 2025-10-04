
import { Image, StyleSheet, Text, View } from "react-native";
export const Loader = () => {
  return (
    <View style={styles.loaderOverlay}>
      <View >
        <Image
          source={require('../asset/loader.gif')}
          style={styles.loaderImage}
        />
      </View>
      
    </View>
  );
};
const styles = StyleSheet.create({
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)', // semi-transparent overlay
    zIndex:9,
  },
  loaderImage: {
    width: 120,
    height: 120,
  },
  text: {
    fontSize: 15,
    marginTop: -30,
    color: '#1A73E8',
    fontWeight: 'bold',
    textAlign: 'center',
  },
})