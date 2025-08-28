import {useState, useEffect, use} from 'react';
import { useToken } from './useToken';

// This custom hook will use the useToken hook to get the token

export const useUser = () => {
    // NB: useToken is gonna be using the TokenContext
    const [token] = useToken();
    const getPayloadFromToken = (token) => {
        // Remember that the token constists of three parts separated by dots
        // the header, the payload and the signature
        const encodedPayload = token.split('.')[1];
        const decodedPayload = atob(encodedPayload);
        // Finally parse it into a javascript object
        return JSON.parse(decodedPayload);
    }
    const [user, setUser] = useState(() => {
        // if there is not a token, it means that there is no currently logged in user
        console.log('token in useUser', token);
        if (!token) {
            return null;
        }
        return getPayloadFromToken(token);
    });
    
    // Function called whenever token changes
    useEffect(() => {
        if (token) {
            setUser(getPayloadFromToken(token));
        } else {
            setUser(null);
        }
    }, [token]);
    
    // Return the user to make it available to other components
    return user;
    }