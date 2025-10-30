import React from 'react';
import { TripSuggestion } from '../types';

interface TripCardProps {
  trip: TripSuggestion;
  onSelect: (trip: TripSuggestion) => void;
}

const TripCard: React.FC<TripCardProps> = ({ trip, onSelect }) => {
  return (
    <button 
      onClick={() => onSelect(trip)}
      className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col text-left focus:outline-none focus:ring-4 focus:ring-blue-300"
      aria-label={`View details for ${trip.location}`}
    >
      <div className="w-full h-48 bg-slate-200">
        {trip.imageBase64 ? (
          <img 
            src={trip.imageBase64} 
            alt={`AI-generated image of ${trip.location}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-300 animate-pulse flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold font-display text-slate-900 mb-2">{trip.location}</h3>
        <p className="text-slate-600 text-sm mb-4 flex-grow">{trip.description}</p>
        
        <div className="mb-4">
          <h4 className="font-semibold text-slate-800 mb-2">Top Activities:</h4>
          <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
            {trip.activities.slice(0, 2).map((activity, index) => (
              <li key={index}>{activity}</li>
            ))}
             {trip.activities.length > 2 && <li className="text-slate-500">and more...</li>}
          </ul>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-200 text-right">
          <p className="text-slate-500 text-sm">Estimated Cost</p>
          <p className="text-2xl font-bold text-blue-600">₹{trip.estimatedCost.toLocaleString('en-IN')}</p>
        </div>
      </div>
    </button>
  );
};

export default TripCard;