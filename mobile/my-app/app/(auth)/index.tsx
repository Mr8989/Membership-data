import {
  Text,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Image,
  Platform,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useAuthStore } from "../../store/authStore";

const { height, width } = Dimensions.get("screen");

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, login} = useAuthStore();

  const handleLogin = async () => {
    const result = await login(email, password);
    if (!result.success) return Alert.alert("Please fill in all fields");
  };

  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/*Iluustator */}
          <View style={styles.topIllustration}>
            <Image
              source={require("../../assets/images/y.png")}
              style={styles.illustrationImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.card}>
            <View style={styles.formContainer}>
              {/*Email */}
              <View style={styles.inputGroup}>
                <Text>Email</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#4c6aafff"
                    style={{ marginRight: 10 }}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#767676"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {/*Password */}
                <View style={styles.inputGroup}>
                  <Text>Password</Text>
                  <View style={styles.inputContainer}>
                    {/*Left icons */}
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="#4c6aafff"
                      style={{ marginRight: 10 }}
                    />
                    {/*Input */}
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      placeholderTextColor="#767676"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    {/*show or hide password */}
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color="#4c6aafff"
                      />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Login</Text>
                    )}
                  </TouchableOpacity>
                  {/*Footer */}
                  <View style={styles.footer}>
                    <Text style={styles.footerText}>
                      Don't have an account ?
                    </Text>
                    <Link href="/signup" asChild>
                      <TouchableOpacity>
                        <Text style={styles.link}>Sign Up</Text>
                      </TouchableOpacity>
                    </Link>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: "center",
    height: height,
    width: width,
  },
  text: {
    color: "blue",
  },
  topIllustration: {
    alignItems: "center",
    width: "100%",
  },
  illustrationImage: {
    width: 500,
    height: 500,
    marginTop: -70,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    //elevation: 5,
    borderWidth: 2,
    borderColor: "#c8e6c9",
    marginTop: -24,
  },
  formContainer: {
    marginBottom: 16,
    width: 300,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: "#2e5a2e",
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4faf5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4c6aafff",
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 48,
    color: "#4c6aafff",
  },
  eyeIcon: {
    padding: 8,
  },
  button: {
    backgroundColor: "#4c6aafff",
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowColor: "#000000",
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: "#4c6aafff",
    marginRight: 5,
  },
  link: {
    color: "#4c6aafff",
    fontWeight: "600",
  },
});
