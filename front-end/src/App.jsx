import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router";
import { SignUpPage } from './SignUpPage';
import { LogInPage } from './LogInPage';
import { UserInfoPage } from './UserInfoPage';
import { PrivateRoute } from './PrivateRoute';


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
          {/** We have to have Private route inside Route component because
           * we're using 'Routes' component from react-router that wants inside of it
           * only 'Route' components as children.
           * So it will be Route component to display our PrivateRoute component
           */}
          <Route element = 
              {<PrivateRoute redirect = "/log-in" isAllowed={user}/>}>
                    <Route path="/" element={<UserInfoPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App