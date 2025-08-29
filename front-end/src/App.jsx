import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router";
import { SignUpPage } from './SignUpPage';
import { LogInPage } from './LogInPage';
import { UserInfoPage } from './UserInfoPage';
import { PrivateRoute } from './PrivateRoute';
import { PleaseVerifyEmailPage } from './PleaseVerifyEmailPage';
import { EmailVerificationLandingPage } from './EmailVerificationLandingPage';
import {useUser} from './useUser';

function App() {
  const user = useUser();
  console.log('user in App', user);
  return (
    <div className="page-container">
      <BrowserRouter>
        <Routes>
          <Route path="/log-in" element={<LogInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/please-verify" element={<PleaseVerifyEmailPage />} />
          <Route path="/verify-email/:verificationString" element={<EmailVerificationLandingPage />} />
          {/** We have to have Private route inside Route component because
           * we're using 'Routes' component from react-router that wants inside of it
           * only 'Route' components as children.
           * So it will be Route component to display our PrivateRoute component
           */}
          <Route element = 
              {<PrivateRoute redirectPath = "log-in" isAllowed={!!user}/>}>
                    <Route path="/" element={<UserInfoPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App