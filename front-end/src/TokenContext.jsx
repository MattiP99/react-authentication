import { useState, createContext } from "react";

export const TokenContext = createContext();
export const TokenProvider = ({children}) => {
     const [token, setTokenInternal] = useState(() => {
     /**  How to make sure the token persists even when the user
     visits other pages or refresh the page?

     We can use localStorage to do that*/
     return localStorage.getItem('token'); 
    });
    
    // Remeber that local storage only stores strings and
    // sicne newToken is alreaday a string we don't have to stringify that
    const setToken = newToken => {
        if (!newToken) {
            return localStorage.removeItem('token');
        }
        localStorage.setItem('token', newToken);
        setTokenInternal(newToken);
    }
    return (
    <TokenContext.Provider value={[token, setToken]}>
        {children}
    </TokenContext.Provider>
    )
}
