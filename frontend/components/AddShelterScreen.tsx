import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput, StyleSheet, I18nManager } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API_URL, GOOGLE_MAPS_API_KEY } from '@env';
import i18n from '../i18n';

const AddShelterScreen: React.FC = () => {
  const { t } = useTranslation();
  const [address, setAddress] = useState<string>('');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isRTL, setIsRTL] = useState(I18nManager.isRTL);

  useEffect(() => {
    const currentLanguage = i18n.language;
    const isLanguageRTL = currentLanguage === 'he';
    setIsRTL(isLanguageRTL);
  }, [i18n.language]);

  const handleSubmit = async () => {
    if (coordinates) {
      try {
        const response = await axios.post(`${API_URL}/api/shelters`, {
          name: address,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        });

        Alert.alert(t('success'), t('add_shelter_screen.shelter_added_success'));
      } catch (error) {
        console.error('Error adding shelter:', error);
        Alert.alert(t('error'), t('add_shelter_screen.failed_to_add_shelter'));
      }
    } else {
      Alert.alert(t('error'), t('add_shelter_screen.fill_all_fields_error'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('add_shelter_screen.title')}</Text>
      
      {/* Google Places Input */}
      <View style={styles.googleInputContainer}>
        <GooglePlacesAutocomplete
          placeholder={t('add_shelter_screen.enter_address')}
          onPress={(data, details = null) => {
            const lat = details?.geometry.location.lat;
            const lng = details?.geometry.location.lng;
            setCoordinates({ latitude: lat || 0, longitude: lng || 0 });
            setAddress(data.description);
          }}
          query={{
            key: GOOGLE_MAPS_API_KEY,
            language: i18n.language,
            components: 'country:il',
            region: 'il',
          }}
          fetchDetails={true}
          styles={{
            textInput: {
              width: '100%',
              paddingVertical: 10,
              paddingHorizontal: 15,
              borderWidth: 1,
              borderColor: 'gray',
              borderRadius: 5,
              textAlign: isRTL ? 'right' : 'left',
              color: 'black',
              placeholderTextColor: 'black',
            },
            textInputContainer: {
              borderTopWidth: 0,
              borderBottomWidth: 0,
              paddingHorizontal: 10,
              placeholderTextColor: '#000',
            },
            predefinedPlacesDescription: {
              color: 'black',
            },
            description: {
              color: 'black',
            },
            container: {
              flex: 0,
              width: '100%',
            },
            listView: {
              width: '100%',
            },
          }}
          textInputProps={{
            placeholderTextColor: 'black'
          }}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
        <Text style={styles.addButtonText}>{t('add_shelter_screen.add_shelter_button')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  googleInputContainer: {
    width: '100%',
    marginBottom: 50, // Space after Google autocomplete input
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: 'black',
  },
  addButton: {
    backgroundColor: 'black',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 5,
    width: '100%',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AddShelterScreen;
