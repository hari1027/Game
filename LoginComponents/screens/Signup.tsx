import { StyleSheet, Text, View, TextInput, Pressable, ScrollView } from 'react-native'
import React, { useContext, useState } from 'react'

//ReactNativeElements
import Snackbar from 'react-native-snackbar'

//context Api
import { AppwriteContext } from '../appwrite/AppwriteContext'

//Navigation
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AuthStackParamList } from '../routes/AuthStack'
import axios from 'axios'

type SignupScreenProps = NativeStackScreenProps<AuthStackParamList, 'Signup'>

const Signup = ({ navigation }: SignupScreenProps) => {
    const { appwrite, setIsLoggedIn } = useContext(AppwriteContext)

    const [error, setError] = useState<string>('')
    const [name, setName] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [token, setToken] = useState<any>('')
    const [repeatPassword, setRepeatPassword] = useState<string>('')
    const [sentToken, setSentToken] = useState<any>('')

    async function handleEmailVerification() {
        if (email.length < 1) {
            setError('email is required');
        } else {
            try {
                const data = { email }
                const response = await axios.post("http://10.0.2.2:5000/send-email", data)
                if (response.data) {
                    console.log("yes")
                    Snackbar.show({
                        text: 'verification token has been sent you mail',
                        duration: Snackbar.LENGTH_SHORT
                    })
                    setSentToken(response.data.token)
                }
                else {
                    Snackbar.show({
                        text: 'Email verification failed',
                        duration: Snackbar.LENGTH_SHORT
                    })
                }
            }
            catch (error) {
                setError(`Email Verification Failed: ${error}`)
            }
        }
    }

    async function handleSignUp() {
        if (
            name.length < 1 ||
            email.length < 1 ||
            password.length < 1 ||
            repeatPassword.length < 1 ||
            token.length < 1
        ) {
            setError('All fields are required');
        } else if (password !== repeatPassword) {
            setError('Passwords do not match');
        } else {
            const user = {
                email,
                password,
                name,
            };
            if (JSON.stringify(token) === JSON.stringify(sentToken)) {
                appwrite.createAccount(user)
                    .then((response: any) => {
                        if (response) {
                            setIsLoggedIn(true)
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        setError(e.message)
                    })
            }
            else {
                Snackbar.show({
                    text: 'Signup not Successful.Please provide correct details',
                    duration: Snackbar.LENGTH_LONG
                })
                setToken('')
                setSentToken('')
            }
        }
    }

    return (
        <View style={styles.formContainer}>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                {/* Email */}
                <TextInput
                    value={email}
                    editable={sentToken !== '' ? false : true}
                    keyboardType="email-address"
                    onChangeText={text => {
                        setError('');
                        setEmail(text);
                    }}
                    placeholderTextColor={'#AEAEAE'}
                    placeholder="Email"
                    style={styles.input}
                />

                {/* Name */}
                {sentToken !== '' &&
                    <TextInput
                        value={name}
                        onChangeText={text => {
                            setError('');
                            setName(text);
                        }}
                        placeholderTextColor={'#AEAEAE'}
                        placeholder="Name"
                        style={styles.input}
                    />
                }

                {/* Password */}
                {sentToken !== '' &&
                    <TextInput
                        value={password}
                        onChangeText={text => {
                            setError('');
                            setPassword(text);
                        }}
                        placeholderTextColor={'#AEAEAE'}
                        placeholder="Password"
                        secureTextEntry
                        style={styles.input}
                    />
                }

                {/* Repeat password */}
                {sentToken !== '' &&
                    <TextInput
                        secureTextEntry
                        value={repeatPassword}
                        onChangeText={text => {
                            setError('');
                            setRepeatPassword(text);
                        }}
                        placeholderTextColor={'#AEAEAE'}
                        placeholder="Repeat Password"
                        style={styles.input}
                    />
                }

                {/*token*/}
                {sentToken !== '' &&
                    <TextInput
                        value={token}
                        onChangeText={text => {
                            setToken(text)
                        }}
                        placeholderTextColor={'#AEAEAE'}
                        placeholder="Please Enter The token sent to your mail"
                        style={styles.input}
                    />
                }

                {/* Validation error */}
                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                {/* Verify button */}
                {sentToken === '' &&
                    <Pressable
                        onPress={handleEmailVerification}
                        style={[styles.btn, { marginTop: error ? 10 : 20 }]}>
                        <Text style={styles.btnText}>Verify Email</Text>
                    </Pressable>
                }

                {/* Signup button */}
                {sentToken !== '' &&
                    <Pressable
                        onPress={handleSignUp}
                        style={[styles.btn, { marginTop: error ? 10 : 20 }]}>
                        <Text style={styles.btnText}>Sign Up</Text>
                    </Pressable>
                }

                {/* Login navigation */}
                <Pressable
                    onPress={() => navigation.navigate('Login')}
                    style={styles.loginContainer}>
                    <Text style={styles.haveAccountLabel}>
                        Already have an account?{'  '}
                        <Text style={styles.loginLabel}>Login</Text>
                    </Text>
                </Pressable>
            </ScrollView>
        </View>
    );
}

export default Signup

const styles = StyleSheet.create({
    formContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignContent: 'center',
    },
    appName: {
        color: '#f02e65',
        fontSize: 40,
        fontWeight: 'bold',
        alignSelf: 'center',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#fef8fa',
        padding: 10,
        height: 40,
        alignSelf: 'center',
        borderRadius: 5,

        width: '80%',
        color: '#000000',

        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,

        elevation: 1,
    },
    errorText: {
        color: 'red',
        alignSelf: 'center',
        marginTop: 10,
    },
    btn: {
        backgroundColor: '#ffffff',
        padding: 10,
        height: 45,

        alignSelf: 'center',
        borderRadius: 5,
        width: '80%',
        marginTop: 10,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,

        elevation: 3,
    },
    btnText: {
        color: '#484848',
        alignSelf: 'center',
        fontWeight: 'bold',
        fontSize: 18,
    },
    loginContainer: {
        marginTop: 60,
    },
    haveAccountLabel: {
        color: '#484848',
        alignSelf: 'center',
        fontWeight: 'bold',
        fontSize: 15,
    },
    loginLabel: {
        color: '#1d9bf0',
    },
});