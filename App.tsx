import React, { useState, useCallback } from 'react';
import { TripSuggestion } from './types';
import { generateTripPlan, generateMoreTripPlans, generateImageForTrip } from './services/geminiService';
import Header from './components/Header';
import TripCard from './components/TripCard';
import TripDetail from './components/TripDetail';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const [mood, setMood] = useState<string>('adventurous');
  const [budget, setBudget] = useState<string>('50000');
  const [numberOfPeople, setNumberOfPeople] = useState<string>('2');
  const [durationInDays, setDurationInDays] = useState<string>('4');
  const [tripSuggestions, setTripSuggestions] = useState<TripSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSeeingMore, setIsSeeingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<TripSuggestion | null>(null);

  const handleGeneratePlan = useCallback(async () => {
    if (!mood || !budget || !numberOfPeople || !durationInDays) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTripSuggestions([]);
    setSelectedTrip(null);

    try {
      const budgetNumber = parseFloat(budget);
      const people = parseInt(numberOfPeople, 10);
      const days = parseInt(durationInDays, 10);

      if (isNaN(budgetNumber) || isNaN(people) || isNaN(days) || people <= 0 || days <= 0) {
        setError('Please enter valid, positive numbers for all fields.');
        setIsLoading(false);
        return;
      }
      
      const suggestions = await generateTripPlan(mood, budgetNumber, people, days);
      setTripSuggestions(suggestions);
      setIsLoading(false);

      suggestions.forEach(async (suggestion, index) => {
        try {
          const imageBase64 = await generateImageForTrip(suggestion.imageQuery);
          setTripSuggestions(prevSuggestions => {
            const newSuggestions = [...prevSuggestions];
            if (newSuggestions[index]) {
                newSuggestions[index] = { ...newSuggestions[index], imageBase64: `data:image/png;base64,${imageBase64}` };
            }
            return newSuggestions;
          });
        } catch (imageError) {
          console.error(`Failed to generate image for ${suggestion.location}`, imageError);
        }
      });

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
      setIsLoading(false);
    }
  }, [mood, budget, numberOfPeople, durationInDays]);

  const handleSeeMore = useCallback(async () => {
    setIsSeeingMore(true);
    setError(null);

    try {
        const budgetNumber = parseFloat(budget);
        const people = parseInt(numberOfPeople, 10);
        const days = parseInt(durationInDays, 10);
        const existingLocations = tripSuggestions.map(t => t.location);
        
        const newSuggestions = await generateMoreTripPlans(mood, budgetNumber, people, days, existingLocations);
        
        const currentSuggestionsCount = tripSuggestions.length;
        setTripSuggestions(prev => [...prev, ...newSuggestions]);
        
        newSuggestions.forEach(async (suggestion, index) => {
            try {
                const imageBase64 = await generateImageForTrip(suggestion.imageQuery);
                setTripSuggestions(prevSuggestions => {
                    const newSuggestionsState = [...prevSuggestions];
                    const targetIndex = currentSuggestionsCount + index;
                    if (newSuggestionsState[targetIndex]) {
                        newSuggestionsState[targetIndex] = { ...newSuggestionsState[targetIndex], imageBase64: `data:image/png;base64,${imageBase64}` };
                    }
                    return newSuggestionsState;
                });
            } catch (imageError) {
                console.error(`Failed to generate image for ${suggestion.location}`, imageError);
            }
        });
    } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching more suggestions.');
    } finally {
        setIsSeeingMore(false);
    }
  }, [mood, budget, numberOfPeople, durationInDays, tripSuggestions]);


  const handleSelectTrip = (trip: TripSuggestion) => {
    setSelectedTrip(trip);
  };

  const handleGoHome = () => {
    setSelectedTrip(null);
  };

  return (
    <div className="min-h-screen font-sans text-slate-800">
      <Header onHomeClick={handleGoHome} />
      <main className="container mx-auto px-4 py-8 md:py-12">
        {selectedTrip ? (
          <TripDetail trip={selectedTrip} onClose={handleGoHome} />
        ) : (
          <>
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-display text-slate-900 font-bold mb-4">
                Craft Your Perfect Getaway
              </h1>
              <p className="text-lg text-slate-700 mb-8">
                Tell us how you feel and what you want to spend. Our AI will handle the rest.
              </p>
            </div>

            <div className="max-w-xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="mood" className="block text-sm font-medium text-slate-700 mb-2">What's your mood?</label>
                  <input
                    type="text"
                    id="mood"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    placeholder="e.g., Relaxing"
                    className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-slate-700 mb-2">Budget (₹)?</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">₹</span>
                    <input
                      type="number"
                      id="budget"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g., 75000"
                      className="w-full pl-7 pr-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                </div>
                 <div>
                  <label htmlFor="people" className="block text-sm font-medium text-slate-700 mb-2">How many people?</label>
                  <input
                    type="number"
                    id="people"
                    value={numberOfPeople}
                    onChange={(e) => setNumberOfPeople(e.target.value)}
                    placeholder="e.g., 2"
                    min="1"
                    className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label htmlFor="days" className="block text-sm font-medium text-slate-700 mb-2">Duration (in days)?</label>
                  <input
                    type="number"
                    id="days"
                    value={durationInDays}
                    onChange={(e) => setDurationInDays(e.target.value)}
                    placeholder="e.g., 5"
                    min="1"
                    className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>
              <button
                onClick={handleGeneratePlan}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? <LoadingSpinner /> : 'Generate My Trip Plan'}
              </button>
            </div>

            <div className="mt-12">
              {error && (
                <div className="max-w-3xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center" role="alert">
                  <strong className="font-bold">Oops!</strong>
                  <span className="block sm:inline ml-2">{error}</span>
                </div>
              )}

              {isLoading && (
                  <div className="flex justify-center items-center mt-16">
                      <LoadingSpinner />
                      <p className="ml-4 text-slate-700 text-lg">Planning your perfect trip...</p>
                  </div>
              )}

              {!isLoading && tripSuggestions.length === 0 && !error && (
                <div className="text-center text-slate-700 bg-white rounded-xl p-8 max-w-md mx-auto mt-16 shadow-md border border-slate-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v1.586m0 7.912v1.586" />
                  </svg>
                  <h3 className="mt-4 text-xl font-semibold text-slate-800">Your adventure awaits</h3>
                  <p className="mt-1">Enter your details above and let's plan your next journey!</p>
                </div>
              )}

              {tripSuggestions.length > 0 && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {tripSuggestions.map((trip, index) => (
                    <TripCard key={index} trip={trip} onSelect={handleSelectTrip} />
                  ))}
                </div>
              )}

              {tripSuggestions.length > 0 && !isLoading && (
                <div className="mt-12 text-center">
                  <button
                    onClick={handleSeeMore}
                    disabled={isSeeingMore}
                    className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                  >
                    {isSeeingMore ? (
                      <>
                        <LoadingSpinner />
                        <span className="ml-2">Loading More...</span>
                      </>
                    ) : (
                      'See More Locations'
                    )}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default App;