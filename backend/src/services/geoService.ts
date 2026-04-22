import axios from 'axios'

export interface Location {
  lat: number
  lng: number
}

export const geoService = {
  // Haversine formula for distance calculation
  calculateHaversineDistance(from: Location, to: Location): number {
    const R = 6371 // Earth's radius in km
    const dLat = ((to.lat - from.lat) * Math.PI) / 180
    const dLng = ((to.lng - from.lng) * Math.PI) / 180

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((from.lat * Math.PI) / 180) *
        Math.cos((to.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    return Math.round(distance * 100) / 100
  },

  // Get distance matrix from Google Maps API (more accurate, includes traffic)
  async getGoogleMapsDistance(from: Location, to: Location): Promise<number | null> {
    try {
      if (!process.env.GOOGLE_MAPS_API_KEY) {
        return null
      }

      const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
        params: {
          origins: `${from.lat},${from.lng}`,
          destinations: `${to.lat},${to.lng}`,
          key: process.env.GOOGLE_MAPS_API_KEY,
          units: 'metric',
        },
      })

      if (response.data.rows?.[0]?.elements?.[0]?.distance?.value) {
        return response.data.rows[0].elements[0].distance.value / 1000 // Convert meters to km
      }

      return null
    } catch (error) {
      console.error('Google Maps distance error:', error)
      return null
    }
  },

  // Filter volunteers by proximity to incident
  async filterByProximity(
    incident: { coordinates: Location },
    volunteers: Array<any>,
    radiusKm: number = 30
  ): Promise<Array<any>> {
    const filtered = volunteers.map((v) => ({
      ...v,
      distance: geoService.calculateHaversineDistance(
        incident.coordinates,
        v.homeCoordinates || v.currentCoordinates || { lat: 0, lng: 0 }
      ),
    }))

    return filtered.filter((v) => v.distance <= radiusKm)
  },

  // Inject proximity score into candidate objects
  injectProximityScore(candidates: Array<any>): Array<any> {
    return candidates.map((c) => ({
      ...c,
      proximityScore: 1 / (c.distance + 1), // Prevent division by zero, decay with distance
      proximityFactor: 1 / (c.distance + 0.5),
    }))
  },

  // Get geocoding from address
  async geocodeAddress(address: string): Promise<Location | null> {
    try {
      if (!process.env.GOOGLE_MAPS_API_KEY) {
        return null
      }

      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address,
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      })

      if (response.data.results?.[0]?.geometry?.location) {
        const { lat, lng } = response.data.results[0].geometry.location
        return { lat, lng }
      }

      return null
    } catch (error) {
      console.error('Geocoding error:', error)
      return null
    }
  },

  // Get reverse geocoding (lat/lng to address)
  async reverseGeocodeLocation(location: Location): Promise<string | null> {
    try {
      if (!process.env.GOOGLE_MAPS_API_KEY) {
        return null
      }

      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          latlng: `${location.lat},${location.lng}`,
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      })

      if (response.data.results?.[0]?.formatted_address) {
        return response.data.results[0].formatted_address
      }

      return null
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      return null
    }
  },
}
