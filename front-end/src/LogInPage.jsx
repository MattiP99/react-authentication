import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToken } from './useToken';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const LogInPage = () => {
  const [token, setToken] = useToken();
  const [errorMessage, setErrorMessage] = useState('');

  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');

  // State variable to keep track of url that we load from the server
  // because of google auth service. Note we couldn't do this in the front end
  // because we need to keep the client secret private

  const [googleOauthUrl, setGoogleOauthUrl] = useState('');
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const oauthToken = queryParams.get('token'); 
  
  // We'll use the history to navigate the user
  // programmatically later on (we're not using it yet)
  const navigate = useNavigate();

  useEffect(() => {
    // If there is a token in the url it means that the user has been
    // redirected from google oauth flow and we can log them in
    if (oauthToken) {
      setToken(oauthToken);
      navigate('/', { replace: true });
    }
  }, [oauthToken, setToken, navigate]);

  // We want to display this only at the beginning when the component loads
  useEffect(() => {
    const loadOauthUrl = async () => {
      try{
        const response = await axios.get('/api/auth/google/url');
        const {url} = response.data;
        setGoogleOauthUrl(url);
      }catch (e){
        console.log(e);
      }
    }
    loadOauthUrl();
  }, [])
  

  const onLogInClicked = async () => {
    const response = await axios.post('/api/log-in', {
      email: emailValue,
      password: passwordValue 
    });
    const {token} = response.data;
    setToken(token);
    // navigate to the user info page
    navigate('/', {replace: true});
  }

  return (
    <div className="content-container">
      <h1>Log In</h1>
      {errorMessage && <div className="fail">{errorMessage}</div>}
      <input
        value={emailValue}
        onChange={e => setEmailValue(e.target.value)}
        placeholder="someone@gmail.com" />
      <input
        type="password"
        value={passwordValue}
        onChange={e => setPasswordValue(e.target.value)}
        placeholder="password" />
      <hr />
      <button
        disabled={!emailValue || !passwordValue}
        onClick={onLogInClicked}>Log In</button>
      <button onClick={() => navigate('/forgot-password')}>Forgot your password?</button>
      <button onClick={() => navigate('/sign-up')}>Don't have an account? Sign Up</button>
      {/** Button for google login that is disabled if there is no
       * googleOauthUrl loaded from the server yet
       * We're using tihs method instead of using navigate
      * bacause we're switching completly url, we're not changing 
      * path inside of our application 
      */}
      <button 
          disabled={!googleOauthUrl}
          onClick={() => {window.location.href = googleOauthUrl}}>
          Log in with google
      </button>
    </div>
  );
}