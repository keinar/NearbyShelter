import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, I18nManager, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API_URL } from '@env';
import i18n from '../i18n';
import { useNavigation } from '@react-navigation/native';

const AdminLoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRTL, setIsRTL] = useState(I18nManager.isRTL);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setIsRTL(i18n.language === 'he');
  }, [i18n.language]);

  const handleLogin = async () => {
    if (!email || !password) {
        Alert.alert(t('error'), t('missing_fields'));
        return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/admin/login`, {
        username: email,
        password: password,
      });

      const { token } = response.data;
      if (token) {
        await AsyncStorage.setItem('adminToken', token);
        // Replace current screen so user can't "back" into login
        navigation.replace('AdminManagement');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(t('login_failed'), t('check_credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('admin_login')}</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
            style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
            placeholder={t('email_placeholder')}
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
        />
        
        <View style={styles.passwordWrapper}>
            <TextInput
            style={[styles.input, styles.passwordInput, { textAlign: isRTL ? 'right' : 'left' }]}
            placeholder={t('password_placeholder')}
            placeholderTextColor="#666"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            />
            <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)} 
                style={styles.eyeIcon}
            >
            <Text style={styles.toggleText}>
                {showPassword ? t('hide') : t('show')}
            </Text>
            </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[styles.loginButton, loading && styles.disabledButton]} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
            <ActivityIndicator color="white" />
        ) : (
            <Text style={styles.loginButtonText}>{t('login_button')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 50,
    backgroundColor: 'white',
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    color: '#333',
    fontSize: 16,
  },
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    marginBottom: 0, 
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  toggleText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#333',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AdminLoginScreen;