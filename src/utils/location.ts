// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

// Get UAE city coordinates
export const getCityCoordinates = (city: string): { latitude: number; longitude: number } | null => {
  const cityCoords: Record<string, { latitude: number; longitude: number }> = {
    dubai: { latitude: 25.276987, longitude: 55.296249 },
    abudhabi: { latitude: 24.453884, longitude: 54.377343 },
    sharjah: { latitude: 25.075276, longitude: 55.105568 },
    ajman: { latitude: 25.405217, longitude: 55.513643 },
    'ras al khaimah': { latitude: 25.674004, longitude: 55.980206 },
    fujairah: { latitude: 25.110844, longitude: 56.329391 },
    'umm al quwain': { latitude: 25.569113, longitude: 55.559813 },
  };

  const normalizedCity = city.toLowerCase().replace(/\s+/g, '');
  return cityCoords[normalizedCity] || null;
};

// Format city names consistently
export const formatCityName = (name: string): string => {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};