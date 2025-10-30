export interface BookingSuggestion {
  name: string;
  bookingLink: string;
}

export interface TripSuggestion {
  location: string;
  description: string;
  detailedDescription: string;
  activities: string[];
  estimatedCost: number;
  hotelSuggestion: BookingSuggestion;
  flightSuggestion: BookingSuggestion;
  imageQuery: string;
  imageBase64?: string;
}