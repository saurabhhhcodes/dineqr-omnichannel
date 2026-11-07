// src/context/RestaurantContext.jsx - Multi-restaurant state & active cafe switcher
import React, { createContext, useContext, useState, useEffect } from 'react';

const RestaurantContext = createContext(null);

const FALLBACK_RESTAURANTS = [
  {
    id: 'rest_losteria',
    name: "L'Osteria Gourmet Bistro",
    slug: 'losteria',
    tagline: 'Artisanal Kitchen & Wood-Fired Oven',
    business_type: 'restaurant',
    station_type: 'table',
    staff_pin: '1234',
  },
  {
    id: 'rest_alexandria_library',
    name: 'Alexandria Study Lounge & Digital Library',
    slug: 'alexandria-library',
    tagline: 'Silent Desks & Daily Passes',
    business_type: 'library',
    station_type: 'desk',
    staff_pin: '1234',
  },
  {
    id: 'rest_glamour_salon',
    name: 'Glamour & Groom Salon & Spa',
    slug: 'glamour-salon',
    tagline: 'Styling & Spa Chairs',
    business_type: 'salon',
    station_type: 'chair',
    staff_pin: '1234',
  },
  {
    id: 'rest_ironpulse_gym',
    name: 'IronPulse Fitness Club & Protein Bar',
    slug: 'ironpulse-gym',
    tagline: 'Performance Fitness',
    business_type: 'gym',
    station_type: 'bay',
    staff_pin: '1234',
  },
  {
    id: 'rest_apex_clinic',
    name: 'Apex Healthcare & Multi-Specialty Clinic',
    slug: 'apex-clinic',
    tagline: 'Outpatient & Diagnostic Care',
    business_type: 'clinic',
    station_type: 'room',
    staff_pin: '1234',
  },
];

export function RestaurantProvider({ children }) {
  const [restaurants, setRestaurants] = useState(FALLBACK_RESTAURANTS);
  const [activeRestaurant, setActiveRestaurant] = useState(() => {
    try {
      const saved = localStorage.getItem('dineqr_active_restaurant');
      return saved ? JSON.parse(saved) : FALLBACK_RESTAURANTS[0];
    } catch {
      return FALLBACK_RESTAURANTS[0];
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchRestaurants = async () => {
    try {
      const res = await fetch('/api/restaurants');
      let data = null;
      const text = await res.text();
      if (text && text.trim().startsWith('{')) {
        data = JSON.parse(text);
      }
      if (data && data.success && data.restaurants && data.restaurants.length > 0) {
        setRestaurants(data.restaurants);

        // If no active restaurant or current one not in list, default to first
        if (!activeRestaurant || !data.restaurants.some((r) => r.id === activeRestaurant.id)) {
          const defaultRest = data.restaurants[0] || FALLBACK_RESTAURANTS[0];
          setActiveRestaurant(defaultRest);
          if (defaultRest) {
            localStorage.setItem('dineqr_active_restaurant', JSON.stringify(defaultRest));
          }
        }
      }
    } catch (err) {
      console.warn('API unavailable, keeping active local tenant defaults:', err.message);
      if (!activeRestaurant) {
        setActiveRestaurant(FALLBACK_RESTAURANTS[0]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const switchRestaurant = (restOrId) => {
    let target = null;
    if (typeof restOrId === 'string') {
      target = restaurants.find((r) => r.id === restOrId || r.slug === restOrId);
    } else {
      target = restOrId;
    }
    if (target) {
      setActiveRestaurant(target);
      localStorage.setItem('dineqr_active_restaurant', JSON.stringify(target));
    }
  };

  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
        activeRestaurant,
        setActiveRestaurant: switchRestaurant,
        refreshRestaurants: fetchRestaurants,
        isLoading,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
}
