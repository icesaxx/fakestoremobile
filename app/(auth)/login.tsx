import { StyleSheet, View, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Button, Text, TextInput } from 'react-native-paper'
import { useMutation } from '@tanstack/react-query'
import useUserStore from '@/stores/user.store'
import { useLocalSearchParams, useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '@/lib/api'
import { createLocalSessionToken, decodeTokenSafely, LOCAL_ACCOUNTS_KEY, parseLocalAccounts } from '@/lib/auth'
import { typography, ui } from '@/theme/ui'

const Login = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [usernameError, setUsernameError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [apiError, setApiError] = useState("")

  const { setUser, setToken } = useUserStore()
  const router = useRouter()
  const params = useLocalSearchParams<{ username?: string }>()

  useEffect(() => {
    if (params.username) {
      setUsername(params.username)
    }
  }, [params.username])

  const loginMutation = useMutation({
    mutationFn: async () => {
      const normalizedUsername = username.trim()
      const normalizedPassword = password.trim()

      const rawAccounts = await AsyncStorage.getItem(LOCAL_ACCOUNTS_KEY)
      const localAccounts = parseLocalAccounts(rawAccounts)
      const localAccount = localAccounts.find((acc) => acc.username === normalizedUsername)

      if (localAccount && localAccount.password === normalizedPassword) {
        const localToken = createLocalSessionToken(localAccount.username)
        return {
          token: localToken,
          localUser: {
            iat: Math.floor(Date.now() / 1000),
            sub: String(localAccount.id),
            user: localAccount.username,
          },
        }
      }

      const res = await api.post("/auth/login", {
        username: normalizedUsername,
        password: normalizedPassword
      })
      return res.data
    },
    onSuccess: async (data) => {
      setApiError("")

      const decoded = data.localUser ?? decodeTokenSafely(data.token);
      if (!decoded?.sub) {
        setApiError("Invalid token received from server")
        return
      }

      setUser(decoded)
      setToken(data.token)

      await AsyncStorage.multiSet([
        ["token", data.token],
        ["user", JSON.stringify(decoded)],
      ])

      router.replace("/(tabs)")
    },
    onError: () => {
      setApiError("Invalid username or password")
    }
  })

  const handleLogin = () => {
    let valid = true

    setUsernameError("")
    setPasswordError("")
    setApiError("")

    if (!username.trim()) {
      setUsernameError("Username is required")
      valid = false
    }

    if (!password.trim()) {
      setPasswordError("Password is required")
      valid = false
    }

    if (!valid) return

    loginMutation.mutate()
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.topGlow} />
        <View style={styles.formWrap}>
          <View style={styles.card}>
            <Image source={require("@/assets/images/fakestorelogo.png")} style={styles.logo} />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to continue shopping</Text>

            <TextInput
              label="Username"
              mode="outlined"
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              error={!!usernameError}
            />
            {usernameError ? (
              <Text style={styles.errorText}>{usernameError}</Text>
            ) : null}

            <TextInput
              label="Password"
              mode="outlined"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              error={!!passwordError}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword((prev) => !prev)}
                />
              }
            />
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}

            {apiError ? (
              <Text style={[styles.errorText, styles.apiError]}>
                {apiError}
              </Text>
            ) : null}

            <Button
              onPress={handleLogin}
              mode="contained"
              loading={loginMutation.isPending}
              disabled={loginMutation.isPending}
              style={styles.loginButton}
              labelStyle={styles.loginButtonLabel}
            >
              Login
            </Button>

            <Button
              mode="text"
              onPress={() => router.push("/(auth)/register")}
              labelStyle={styles.registerLabel}
            >
              New here? Create account
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
}

export default Login

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: ui.pageHorizontal,
    paddingTop: ui.pageTop,
  },
  topGlow: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#dbeafe",
    top: -100,
    right: -80,
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
  logo: {
    width: 64,
    height: 64,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 8,
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
  loginButton: {
    marginTop: 14,
    backgroundColor: "black",
    borderRadius: 10,
  },
  loginButtonLabel: {
    fontFamily: ui.fontFamily,
    fontWeight: "700",
  },
  registerLabel: {
    marginTop: 4,
    fontFamily: ui.fontFamily,
    color: "#1d4ed8",
  },
  errorText: {
    fontFamily: ui.fontFamily,
    color: "red",
    marginTop: 4,
    marginBottom: 2,
  },
  apiError: {
    textAlign: "center",
  },
})
