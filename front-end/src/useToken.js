import {useContext} from 'react';
import { TokenContext } from './TokenContext';

// useToken is a custom hook that will help us manage the token
export const useToken = () => useContext(TokenContext);
