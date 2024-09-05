export const getAuthToken = (): string | null => {
    return localStorage.getItem('authToken'); // Adjust the storage method if necessary
  };
  
  export const setAuthToken = (token: string) => {
    localStorage.setItem('authToken', token);
  };
  
  export const clearAuthToken = () => {
    localStorage.removeItem('authToken');
  };
  