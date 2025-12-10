import React, { useState, useCallback, useRef } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

// Components
import MapScreen from './components/MapScreen';
import AddShelterScreen from './components/AddShelterScreen';
import AdminLoginScreen from './components/AdminLoginScreen';
import AdminManagementScreen from './components/AdminManagementScreen';
import SettingsScreen from './components/SettingsScreen';
import i18n from './i18n';

// Types
type RootStackParamList = {
  MainTabs: undefined;
  AdminLogin: undefined;
  AdminManagement: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * SecretLogo Component
 * Handles the "7 clicks" logic to navigate to the Admin Login screen.
 */
const SecretLogo: React.FC = () => {
  const navigation = useNavigation<any>();
  const [clickCount, setClickCount] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoPress = () => {
    setClickCount((prev) => {
      const newCount = prev + 1;
      
      // Reset count if too much time passes between clicks (2 seconds)
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setClickCount(0), 2000);

      if (newCount >= 7) {
        setClickCount(0);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        navigation.navigate('AdminLogin');
      }
      return newCount;
    });
  };

  return (
    <TouchableOpacity onPress={handleLogoPress} activeOpacity={0.7}>
      <Text style={styles.logoText}>NearbyShelter</Text>
    </TouchableOpacity>
  );
};

/**
 * MainTabs Component
 * Wraps the main application screens accessible to all users.
 */
const MainTabs: React.FC = () => {
  const { t } = useTranslation();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguageModalVisible(false);
  };

  const LanguageButton = () => (
    <TouchableOpacity
      style={styles.languageButton}
      onPress={() => setLanguageModalVisible(true)}
    >
      <Text style={styles.languageButtonText}>{t('language')}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName = 'help'; // Default
            if (route.name === 'Nearby' || route.name === 'בסביבה') iconName = 'place';
            else if (route.name === 'New' || route.name === 'הוספה') iconName = 'add-location';
            else if (route.name === 'Settings' || route.name === 'הגדרות') iconName = 'settings';
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#00008B',
          tabBarInactiveTintColor: '#666',
          headerTitle: () => <SecretLogo />, // The secret trigger is here
          headerRight: () => <LanguageButton />,
        })}
      >
        <Tab.Screen name={t('Nearby')} component={MapScreen} />
        <Tab.Screen name={t('New')} component={AddShelterScreen} />
        <Tab.Screen name={t('Settings')} component={SettingsScreen} />
      </Tab.Navigator>

      {/* Language Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={languageModalVisible}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{t('select_language')}</Text>
            <TouchableOpacity onPress={() => changeLanguage('en')} style={styles.languageOption}>
              <Text style={styles.languageText}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => changeLanguage('he')} style={styles.languageOption}>
              <Text style={styles.languageText}>עברית</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setLanguageModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="AdminLogin" 
          component={AdminLoginScreen} 
          options={{ title: 'Admin Access', headerBackTitle: 'Back' }}
        />
        <Stack.Screen 
          name="AdminManagement" 
          component={AdminManagementScreen} 
          options={{ title: 'Shelter Management', headerLeft: () => null }} // Disable back button on management screen
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 1,
  },
  languageButton: {
    marginRight: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  languageButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalView: {
    width: 280,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  languageOption: {
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  languageText: {
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default App;