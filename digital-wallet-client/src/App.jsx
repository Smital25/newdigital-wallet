import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import Dashboard from "./pages/Dashboard";


function Home(){ return <div style={{padding:40}}>Home — welcome</div>; }
function About(){ return <div style={{padding:40}}>About page</div>; }
function Contact(){ return <div style={{padding:40}}>Contact us page</div>; }

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage/>} />
        <Route path="/register" element={<RegisterPage/>} />
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/about" element={<AboutPage/>} />
         <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/contact" element={<ContactPage/>} />
      </Routes>
    </BrowserRouter>
  );
}
