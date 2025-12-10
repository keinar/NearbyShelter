import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, I18nManager, Alert } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import { Shelter } from '../utils/types';
import { GOOGLE_MAPS_API_KEY, API_URL } from '@env';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface SheltersMapProps {
  initialLocation?: { latitude: number; longitude: number };
  locationName: string;
  shelters: Shelter[];
  onNavigate: (latitude: number, longitude: number) => void;
}

const SheltersMap: React.FC<SheltersMapProps> = ({ initialLocation, locationName, shelters, onNavigate }) => {
  const { t } = useTranslation();
  const mapRef = useRef<MapView>(null);
  
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(initialLocation || null);
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [sheltersData, setSheltersData] = useState<Shelter[]>(shelters);
  
  // RTL support check
  const isRTL = i18n.language === 'he';

  // Fetch Current Location on Mount
  useEffect(() => {
    if (!currentLocation) {
        Geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                setCurrentLocation({ latitude, longitude });
            },
            error => console.error('Error fetching GPS location:', error),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    }
  }, [currentLocation]);

  // Fetch Exact Address for Selected Shelter
  const getExactAddress = useCallback(async (latitude: number, longitude: number) => {
    try {
      const language = isRTL ? 'he' : 'en';
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}&language=${language}`;
      const response = await axios.get(url);
      
      if (response.data.results && response.data.results.length > 0) {
          const address = response.data.results[0].formatted_address;
          setSelectedAddress(address);
      } else {
          setSelectedAddress(t('unknown_address'));
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setSelectedAddress(t('unknown_address'));
    }
  }, [isRTL, t]);

  const handleMarkerPress = (shelter: Shelter) => {
    setSelectedShelter(shelter);
    getExactAddress(shelter.latitude, shelter.longitude);
  };

  // Logic to refresh shelters from both Backend and Google Places
  const refreshShelters = useCallback(async () => {
    if (!currentLocation) return;

    setIsLoading(true);
    try {
        const radius = parseInt((await AsyncStorage.getItem('radius')) || '5000', 10);

        // Fetch from our Backend
        const backendPromise = axios.get(`${API_URL}/api/shelters`);
        
        // Fetch from Google Places
        const googlePromise = axios.get(
            `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${currentLocation.latitude},${currentLocation.longitude}&radius=${radius}&keyword=bomb+shelter&key=${GOOGLE_MAPS_API_KEY}`
        );

        const [backendRes, googleRes] = await Promise.all([backendPromise, googlePromise]);

        const backendShelters = backendRes.data.map((s: Shelter) => ({
            ...s,
            title: t('bomb_shelter'), // Ensure consistent naming
        }));

        const googleShelters = googleRes.data.results.map((place: any) => ({
            _id: place.place_id,
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            title: t('bomb_shelter'),
            description: place.vicinity || t('google_place'),
            approved: true
        }));

        // Merge results, preferring Backend data if needed (logic can be expanded)
        setSheltersData([...backendShelters, ...googleShelters]);

    } catch (error) {
        console.error('Error refreshing shelters:', error);
        Alert.alert(t('error'), t('fetch_shelters_error'));
    } finally {
        setIsLoading(false);
    }
  }, [currentLocation, t]);

  // Initial load
  useEffect(() => {
    if (currentLocation) {
        refreshShelters();
    }
  }, [currentLocation, refreshShelters]);

  const recenterMap = () => {
    if (currentLocation && mapRef.current) {
        mapRef.current.animateToRegion({
            ...currentLocation,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
        }, 800);
        setSelectedShelter(null);
    }
  };

  if (!currentLocation) {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00008B" />
            <Text style={{marginTop: 10}}>{t('locating_you')}</Text>
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {sheltersData.map((shelter, index) => (
          <Marker
            key={shelter._id || index}
            coordinate={{ latitude: shelter.latitude, longitude: shelter.longitude }}
            pinColor="red"
            onPress={() => handleMarkerPress(shelter)}
          />
        ))}
      </MapView>

      <TouchableOpacity onPress={recenterMap} style={styles.recenterButton}>
          <Icon name="my-location" size={24} color="#333" />
      </TouchableOpacity>

      <TouchableOpacity onPress={refreshShelters} style={styles.refreshButton}>
          <Icon name="refresh" size={24} color="#333" />
      </TouchableOpacity>

      {selectedShelter && (
        <View style={styles.cardContainer}>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { textAlign: isRTL ? 'left' : 'right' }]}>
                {selectedShelter.name || selectedShelter.title || t('bomb_shelter')}
            </Text>
            <Text style={[styles.cardAddress, { textAlign: isRTL ? 'left' : 'right' }]}>
                {selectedAddress}
            </Text>
            <TouchableOpacity 
                style={styles.navigateButton} 
                onPress={() => onNavigate(selectedShelter.latitude, selectedShelter.longitude)}
            >
                <Text style={styles.navigateButtonText}>{t('navigate')}</Text>
                <Icon name="navigation" size={20} color="white" style={{marginLeft: 8}} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isLoading && (
        <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#00008B" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  recenterButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  refreshButton: {
    position: 'absolute',
    top: 110,
    right: 16,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  cardContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  navigateButton: {
    backgroundColor: '#00008B',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  navigateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default SheltersMap;