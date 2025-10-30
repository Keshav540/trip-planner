import { GoogleGenAI, Type, Modality } from "@google/genai";
import { TripSuggestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    trips: {
      type: Type.ARRAY,
      description: 'A list of trip suggestions.',
      items: {
        type: Type.OBJECT,
        properties: {
          location: {
            type: Type.STRING,
            description: 'The suggested city and state in India, e.g., "Jaipur, Rajasthan".'
          },
          description: {
            type: Type.STRING,
            description: 'A brief, engaging, one-sentence description of the destination.'
          },
          detailedDescription: {
            type: Type.STRING,
            description: 'A more detailed paragraph describing the location, its highlights, and why it\'s a good fit for the user\'s mood.'
          },
          activities: {
            type: Type.ARRAY,
            description: 'A list of 3-5 suggested activities.',
            items: {
              type: Type.STRING
            }
          },
          estimatedCost: {
            type: Type.NUMBER,
            description: 'An estimated cost for the trip in Indian Rupees (INR), staying within the user\'s budget.'
          },
          hotelSuggestion: {
            type: Type.OBJECT,
            description: 'A suggestion for a hotel.',
            properties: {
                name: { type: Type.STRING, description: 'Name of a suggested hotel.'},
                bookingLink: { type: Type.STRING, description: 'A dummy booking.com link for the hotel.'}
            }
          },
          flightSuggestion: {
            type: Type.OBJECT,
            description: 'A suggestion for flights.',
            properties: {
                name: { type: Type.STRING, description: 'Name of a suggested airline or route.'},
                bookingLink: { type: Type.STRING, description: 'A dummy Google Flights link.'}
            }
          },
          imageQuery: {
            type: Type.STRING,
            description: 'A concise, 2-3 word search query for an AI image generator to get a representative photo of the location (e.g., "Hawa Mahal Jaipur", "Kerala backwaters"). Do not use commas.'
          }
        },
        required: ['location', 'description', 'detailedDescription', 'activities', 'estimatedCost', 'hotelSuggestion', 'flightSuggestion', 'imageQuery']
      }
    }
  },
  required: ['trips']
};


const callGeminiForTrips = async (prompt: string): Promise<TripSuggestion[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    const jsonText = response.text.trim();
    const jsonMatch = jsonText.match(/```json\n([\s\S]*?)\n```/);
    const cleanedJson = jsonMatch ? jsonMatch[1] : jsonText;
    const parsedResponse = JSON.parse(cleanedJson);

    if (parsedResponse && parsedResponse.trips && Array.isArray(parsedResponse.trips)) {
        return parsedResponse.trips as TripSuggestion[];
    } else {
        throw new Error("Invalid response format from API.");
    }
  } catch (error) {
    console.error("Error calling Gemini for trip plan:", error);
    throw new Error("Failed to generate trip plan from Gemini API.");
  }
};


export const generateTripPlan = async (mood: string, budget: number, numberOfPeople: number, durationInDays: number): Promise<TripSuggestion[]> => {
  const prompt = `
    I want to plan a trip in India for ${numberOfPeople} people for ${durationInDays} days.
    Our current mood is "${mood}" and our total budget for the whole group is ₹${budget}.
    
    Please suggest exactly 6 diverse travel destinations within India that would fit this mood, group size, trip duration, and budget.
    
    For each destination, provide the following information:
    1.  location: The city and state (e.g., "Udaipur, Rajasthan").
    2.  description: A single, catchy sentence to summarize the place.
    3.  detailedDescription: A paragraph that elaborates on the destination, its unique appeal, and why it matches the mood.
    4.  activities: A list of 3-5 specific activities suitable for a group of ${numberOfPeople} for a ${durationInDays}-day trip.
    5.  estimatedCost: An estimated cost in Indian Rupees (INR) for the entire group of ${numberOfPeople} people for ${durationInDays} days, which must not exceed our total budget of ₹${budget}.
    6.  hotelSuggestion: A sample hotel name (suitable for ${numberOfPeople} people) and a fictional booking link (e.g., to booking.com).
    7.  flightSuggestion: A sample flight route and a fictional booking link (e.g., to Google Flights).
    8.  imageQuery: A clean, 2-3 word search term for an AI image generator to get a beautiful photo (e.g., "Varanasi Ghats", "Kerala backwaters houseboats"). Do not use commas.
    
    Return the suggestions in a valid JSON object.
  `;

  return callGeminiForTrips(prompt);
};


export const generateMoreTripPlans = async (mood: string, budget: number, numberOfPeople: number, durationInDays: number, existingLocations: string[]): Promise<TripSuggestion[]> => {
    const prompt = `
    I want to plan a trip in India for ${numberOfPeople} people for ${durationInDays} days.
    Our current mood is "${mood}" and our total budget for the whole group is ₹${budget}.

    I have already received suggestions for the following locations: ${existingLocations.join(', ')}.
    
    Please suggest 3 more diverse travel destinations within India that fit my criteria. Crucially, the new suggestions MUST NOT be any of the locations I have already seen.
    
    For each new destination, provide the same information structure as before:
    1.  location
    2.  description
    3.  detailedDescription
    4.  activities
    5.  estimatedCost (must be under ₹${budget})
    6.  hotelSuggestion
    7.  flightSuggestion
    8.  imageQuery
    
    Return the suggestions in a valid JSON object.
  `;
  return callGeminiForTrips(prompt);
}


export const generateImageForTrip = async (imageQuery: string): Promise<string> => {
    try {
        const prompt = `A beautiful, high-quality, realistic photograph of ${imageQuery}. Centered, vibrant colors, travel photography style.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        throw new Error("No image data found in the response.");

    } catch (error) {
        console.error(`Error generating image for query "${imageQuery}":`, error);
        throw new Error("Failed to generate image from Gemini API.");
    }
};