import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { getAuthToken, clearAuthToken } from './authService'; // Adjust the path as necessary

const BASE_URL = 'http://my-book-be-dev.us-west-2.elasticbeanstalk.com';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, 
});

// Function to set the authorization token in the request headers
const setAuthToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Function to handle token expiration
const handleTokenExpiration = () => {
  clearAuthToken();
  window.location.href = '/login'; // Redirect to the login page
};

// Function for POST requests
const post = async (url: string, data: any): Promise<AxiosResponse<any>> => {
  return api.post(url, data);
};

// Function for authenticated requests
// const authenticatedRequest = async (
//   method: 'GET' | 'POST' | 'PUT' | 'DELETE',
//   url: string,
//   data?: any
// ): Promise<AxiosResponse<any>> => {
//   const token = getAuthToken(); // Get the token from the auth service
//   if (token) {
//     setAuthToken(token); // Set the token in the headers
//   }

//   const config: AxiosRequestConfig = {
//     method,
//     url,
//     data,
//   };

//   try {
//     return await api.request(config); // Make the request
//   } catch (error: any) {
//     if (error.response && error.response.status === 401) { 
//       handleTokenExpiration(); // Handle token expiration
//     }
//     throw error; // Throw the error to be handled elsewhere
//   }
// };

const authenticatedRequest = async (
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any,
  params?: any // Add params as an optional parameter
): Promise<AxiosResponse<any>> => {
  const token = getAuthToken(); // Get the token from the auth service
  if (token) {
    setAuthToken(token); // Set the token in the headers
  }

  const config: AxiosRequestConfig = {
    method,
    url,
    data,
    params, // Include params in the config
  };

  try {
    return await api.request(config); // Make the request
  } catch (error: any) {
    if (error.response && error.response.status === 401) { 
      handleTokenExpiration(); // Handle token expiration
    }
    throw error; // Throw the error to be handled elsewhere
  }
};

export { post, authenticatedRequest };
