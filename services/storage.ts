import { AppData } from '../types';
import { INITIAL_DATA } from '../constants';

// The relative path to the PHP API. 
// Ensure api.php is in the same directory as index.html on your server.
const API_ENDPOINT = './api.php';
const LOCAL_STORAGE_KEY = 'venus_dialogics_db_v1';

export const getAppData = async (): Promise<AppData> => {
  try {
    // Attempt to fetch from MySQL Database via PHP
    const response = await fetch(API_ENDPOINT);
    
    // Check if response is valid JSON (sometimes servers return HTML 404s/Errors)
    const contentType = response.headers.get("content-type");
    if (response.ok && contentType && contentType.indexOf("application/json") !== -1) {
      const data = await response.json();
      if (data) {
        // Sync valid DB data to local storage for backup
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        return data;
      }
    } else {
      console.warn("API response was not valid JSON, falling back to local storage.");
    }
  } catch (error) {
    console.warn("Database connection failed (offline or local dev), using Local Storage.", error);
  }

  // Fallback: Local Storage
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  return INITIAL_DATA;
};

export const saveAppData = async (data: AppData): Promise<void> => {
  // 1. Save to Local Storage immediately (Optimistic / Backup)
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));

  // 2. Persist to MySQL Database
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to sync with Database:", error);
    // We don't block the UI here, as we already saved to local storage
  }
};