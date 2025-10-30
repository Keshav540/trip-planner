import React from 'react';
import { TripSuggestion } from '../types';

interface TripDetailProps {
  trip: TripSuggestion;
  onClose: () => void;
}

const TripDetail: React.FC<TripDetailProps> = ({ trip, onClose }) => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <button onClick={onClose} className="flex items-center space-x-2 text-slate-800 font-semibold mb-6 hover:text-blue-600 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span>Back to Suggestions</span>
      </button>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="w-full h-64 md:h-80 bg-slate-200">
            {trip.imageBase64 ? (
                <img
                    src={trip.imageBase64}
                    alt={`AI-generated scenic view of ${trip.location}`}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full bg-slate-300 animate-pulse flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                    </svg>
                </div>
            )}
        </div>
        <div className="p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold font-display text-slate-900 mb-4">{trip.location}</h1>
          <p className="text-slate-700 text-lg mb-6">{trip.detailedDescription}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Activities */}
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-3">Things to Do</h2>
              <ul className="space-y-2">
                {trip.activities.map((activity, index) => (
                  <li key={index} className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-slate-600">{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Booking & Cost */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800 mb-3">Booking Suggestions</h2>
                <div className="space-y-3">
                    <a href={trip.flightSuggestion.bookingLink} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 bg-slate-100 rounded-lg hover:bg-blue-100 transition-colors">
                        <span className="text-2xl mr-3">✈️</span>
                        <div>
                            <p className="font-semibold text-slate-800">Flights</p>
                            <p className="text-sm text-blue-600 underline">{trip.flightSuggestion.name}</p>
                        </div>
                    </a>
                    <a href={trip.hotelSuggestion.bookingLink} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 bg-slate-100 rounded-lg hover:bg-blue-100 transition-colors">
                        <span className="text-2xl mr-3">🏨</span>
                        <div>
                           <p className="font-semibold text-slate-800">Hotel</p>
                           <p className="text-sm text-blue-600 underline">{trip.hotelSuggestion.name}</p>
                        </div>
                    </a>
                </div>
              </div>
              <div className="text-right pt-4 border-t border-slate-200">
                <p className="text-slate-500 text-sm">Estimated Trip Cost</p>
                <p className="text-3xl font-bold text-blue-600">₹{trip.estimatedCost.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetail;