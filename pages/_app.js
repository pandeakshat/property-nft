/* pages/_app.js */

import Link from 'next/link'
import Head from "next/head";
import React, { useEffect } from "react";
import Router from 'next/router'
import '../styles/globals.css'
import "../frontend/Home.css"
import "../frontend/nicepage.css"
import {Fragment} from 'react';
import Navbar from "./Navbar";
import { local } from 'web3modal';


function MyApp({ Component, pageProps }) {

  useEffect(() => {
    localStorage.setItem('auth','0')
    //Checking whether metamask is installed or not
    if (typeof window.ethereum !== 'undefined') {
      console.log('MetaMask is installed!');
    } else {
      error_message.innerHTML = "Hello! Consider adding an ethereum wallet such as MetaMask to fully use this website.";
    }

    //metamask wallet button click event
    const connectButton = document.getElementById("metamask_connection");
    connectButton.addEventListener("click", () => polygonReq(), false);
    
    //polygon request connection
    async function polygonReq() {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",});
        //Checking the network connected is polygon
        const yourNetworkId = '31337';
        if(window.ethereum.networkVersion != yourNetworkId){
            // MetaMask network is wrong
            error_message.innerHTML = "Metamask connected into another network. Please switch to Polygon Network.";
            localStorage.setItem('auth','0');
            window.ethereum.on('chainChanged', () => {
              window.location.reload();
            })
        }
        else{
          window.alert("Succesful!")
          metamask_connection.innerHTML="Connected to MetaMask!";
          localStorage.setItem('auth','1');
          
        }
    }
  }, []);


  return (
    <Fragment>
    <div className="top_div">
    <Navbar />

    </div>
      <Component {...pageProps} />
      <footer class="text-center lg:text-left text-gray-600 fixed bottom-0">
    <div class="footerbg text-center">
      <span> <button className="margin mr-3 text-white" id="metamask_connection">
            Not Connected to MetaMask!
            </button>
            <p id="error_message"></p>
            <button className="mr-3 text-white" id="metamask_disconnect">
                Logout
            </button>
      </span>
    </div>
  </footer>
  

  </Fragment>

  )
}

export default MyApp