import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

const App = () => {
  const [imageUri, setImageUri] = useState(null);
  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImagePicker = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Denied",
        "You need to grant permissions to access the library!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Denied",
        "You need to grant permissions to access the camera!"
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handlePrediction = async () => {
    if (!imageUri) {
      Alert.alert("Error", "Please select or capture an image first!");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "hand.jpg",
      });

      const response = await axios.post(
        "http://192.168.1.125:5000/predict",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setPrediction(response.data.prediction);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Prediction failed, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const CustomButton = ({ title, onPress, backgroundColor }) => (
    <TouchableOpacity
      style={[styles.button, { backgroundColor }]}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require("./assets/logo.png")} style={styles.logo} />

        <Text style={styles.title}>Skin Cancer Prediction</Text>
      </View>
      <View style={styles.buttonContainer}>
        <CustomButton
          title="Open Camera"
          onPress={handleCamera}
          backgroundColor="#DEAA79"
        />
        <CustomButton
          title="Upload Picture"
          onPress={handleImagePicker}
          backgroundColor="#B99470"
        />
      </View>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#DEAC80"
          style={styles.spinner}
        />
      ) : (
        <CustomButton
          title="Predict"
          onPress={handlePrediction}
          backgroundColor="#B5C18E"
        />
      )}
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

      {prediction && (
        <Text
          style={[
            styles.result,
            {
              color:
                prediction === "Malignant"
                  ? "#FF2929"
                  : prediction === "Benign"
                  ? "#118B50"
                  : "#333",
            },
          ]}
        >
          Prediction: {prediction}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: "30%",
    backgroundColor: "#f5f5f5",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 65,
    height: 60,
    textAlign: "center",

    marginRight: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
  },
  buttonContainer: {
    justifyContent: "center",
    marginBottom: 20,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: "100%",
    alignSelf: "center",
  },
  buttonText: {
    textAlign: "center",
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: 12,
    alignSelf: "center",
    marginVertical: 20,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  spinner: {
    marginVertical: 20,
  },
  result: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007BFF",
    marginTop: 20,
    textAlign: "center",
  },
});

export default App;
