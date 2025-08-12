import React from 'react'
import { useState } from 'react'
import {View, Text, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert} from "react-native"
import {useAuthStore} from "../../store/authStore"
import {Ionicons} from "@expo/vector-icons"
import {Link} from "expo-router";

export default function signup() {
  const[username, setUsername] = useState("")
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState(""); 

  const {user, isLoading, signup, token} = useAuthStore();

  const handleSignup = async() => {
      const result = await signup(username, email, password, confirmPassword);

      if(!result.success) Alert.alert("Error", result.error);

      console.log(result)
  }
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          {/**Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome To Membership Data</Text>
            <Text style={styles.subtitle}>Signup here</Text>
          </View>
          {/**Username input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color={"#4c6aafff"}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter username"
                placeholderTextColor="black"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
            {/**Email input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={"#4c6aafff"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter email address"
                  value={email}
                  placeholderTextColor={"black"}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={"#4c6aafff"}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="************"
                    placeholderTextColor={"black"}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color={"#4c6aafff"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              {/**Signup button */}
              <TouchableOpacity
                style={styles.button}
                onPress={handleSignup}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={"#ebebebff"} />
                ) : (
                  <Text style={styles.buttonText}>Sign Up</Text>
                )}
              </TouchableOpacity>
              {/**Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account ?</Text>
                <Link href={"/"} asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Login</Text>
                </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: "center",
    justifyContent:"center"
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    borderWidth: 2,
    borderColor: "gray",
  },
  header: {
    alignItems: "center",
    marginButtom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    fontFamily: "JetBrainsMono-Medium",
    color: "#4c6aafff",
  },
  subtitle: {
    fontSize: 16,
    color: "#4c6aafff",
    textAlign: "center",
  },
  formContainer: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: "#4c6aafff",
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4faf5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "black",
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    color: "black",
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
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    color: "#4c6aafff",
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
});
