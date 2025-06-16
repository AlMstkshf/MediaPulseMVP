/**
 * API Utilities
 * 
 * This module provides utilities for making API requests with proper configuration
 * for both development and Replit environments.
 */

import axios from 'axios';
import { getApiBaseUrl } from './replit-config';

// Create an Axios instance with the base URL
export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

/**
 * Make a GET request to the API
 */
export async function apiGet<T = any>(url: string, params?: any): Promise<T> {
  try {
    const response = await apiClient.get<T>(url, { params });
    return response.data;
  } catch (error) {
    console.error(`Error making GET request to ${url}:`, error);
    throw error;
  }
}

/**
 * Make a POST request to the API
 */
export async function apiPost<T = any>(url: string, data?: any): Promise<T> {
  try {
    const response = await apiClient.post<T>(url, data);
    return response.data;
  } catch (error) {
    console.error(`Error making POST request to ${url}:`, error);
    throw error;
  }
}

/**
 * Make a PUT request to the API
 */
export async function apiPut<T = any>(url: string, data?: any): Promise<T> {
  try {
    const response = await apiClient.put<T>(url, data);
    return response.data;
  } catch (error) {
    console.error(`Error making PUT request to ${url}:`, error);
    throw error;
  }
}

/**
 * Make a DELETE request to the API
 */
export async function apiDelete<T = any>(url: string, params?: any): Promise<T> {
  try {
    const response = await apiClient.delete<T>(url, { params });
    return response.data;
  } catch (error) {
    console.error(`Error making DELETE request to ${url}:`, error);
    throw error;
  }
}