import { StyleSheet, View, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState } from 'react'
import { Button, Text, TextInput } from 'react-native-paper'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { toast } from 'sonner-native'
import api from '@/lib/api'
import { typography, ui } from '@/theme/ui'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LOCAL_ACCOUNTS_KEY, LocalAccount, parseLocalAccounts } from '@/lib/auth'

const Register = () => {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [apiError, setApiError] = useState("")

  const router = useRouter()

  const registerMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/users", {
        email,
        username,
        password,
        name: {
          firstname: firstName,
          lastname: lastName,
        },
        address: {
          city: "Yangon",
          street: "Main street",
          number: 1,
          zipcode: "11111",
          geolocation: {
            lat: "0",
            long: "0",
          },
        },
        phone: "0000000000",
      })
      return response.data
    },
    onSuccess: async (data) => {
      const rawAccounts = await AsyncStorage.getItem(LOCAL_ACCOUNTS_KEY)
      const currentAccounts = parseLocalAccounts(rawAccounts)
      const nextId = typeof data?.id === "number" ? data.id : Date.now()

      const updatedAccounts: LocalAccount[] = [
        ...currentAccounts.filter((acc) => acc.username !== username.trim()),
        {
          id: nextId,
          username: username.trim(),
          password: password.trim(),
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        },
      ]

      await AsyncStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(updatedAccounts))

      setApiError("")
      toast("Account created. Please login.")
      router.replace({
        pathname: "/(auth)/login",
        params: { username },
      })
    },
    onError: () => {
      setApiError("Could not create account. Try again.")
    },
  })

  const handleRegister = () => {
    setApiError("")

    if (!username.trim() || !email.trim() || !password.trim() || !firstName.trim() || !lastName.trim()) {
      setApiError("All fields are required")
      return
    }

    if (!email.includes("@")) {
      setApiError("Please enter a valid email")
      return
    }

    if (password.trim().length < 6) {
      setApiError("Password must be at least 6 characters")
      return
    }

    registerMutation.mutate()
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.formWrap}>
          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to start shopping</Text>

            <TextInput
              label="First Name"
              mode="outlined"
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              label="Last Name"
              mode="outlined"
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
            />
            <TextInput
              label="Username"
              mode="outlined"
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              label="Email"
              mode="outlined"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              label="Password"
              mode="outlined"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword((prev) => !prev)}
                />
              }
            />

            {apiError ? (
              <Text style={styles.errorText}>{apiError}</Text>
            ) : null}

            <Button
              onPress={handleRegister}
              mode="contained"
              loading={registerMutation.isPending}
              disabled={registerMutation.isPending}
              style={styles.registerButton}
              labelStyle={styles.registerButtonLabel}
            >
              Register
            </Button>

            <Button
              mode="text"
              onPress={() => router.replace("/(auth)/login")}
              labelStyle={styles.loginLabel}
            >
              Already have an account? Login
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
}

export default Register

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: ui.pageHorizontal,
    paddingTop: ui.pageTop,
  },
  formWrap: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
  },
  title: {
    ...typography.title,
    color: "#111827",
    textAlign: "center",
    fontSize: 28,
  },
  subtitle: {
    ...typography.subtitle,
    textAlign: "center",
    marginTop: 2,
    marginBottom: 10,
  },
  input: {
    marginTop: 10,
  },
  registerButton: {
    marginTop: 14,
    backgroundColor: "black",
    borderRadius: 10,
  },
  registerButtonLabel: {
    fontFamily: ui.fontFamily,
    fontWeight: "700",
  },
  loginLabel: {
    marginTop: 4,
    fontFamily: ui.fontFamily,
    color: "#1d4ed8",
  },
  errorText: {
    fontFamily: ui.fontFamily,
    color: "red",
    textAlign: "center",
    marginTop: 8,
  },
})
