/* pages/index.js */
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import Image from 'next/image'
import {Fragment} from 'react';
import Info_1 from "./info1";
import Info_2 from "./info2";
import Card from "react-bootstrap/Card";
import ReactDOM from "react-dom";
import React, { Component } from "react";

import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    /* create a generic provider and query for unsold market items */
    const provider = new ethers.providers.JsonRpcProvider()
    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, provider)
    const data = await contract.fetchMarketItems()

    /*
    *  map over items returned from smart contract and format 
    *  them as well as fetch their token metadata
    */
    const items = await Promise.all(data.map(async i => {
      const tokenUri = await contract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded') 
  }
  async function buyNft(nft) {
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)

    /* user will be prompted to pay the asking proces to complete the transaction */
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')   
    const transaction = await contract.createMarketSale(nft.tokenId, {
      value: price
    })
    await transaction.wait()
    loadNFTs()
  }
  if (loadingState === 'loaded' && !nfts.length) return (<Fragment><Info_1/><h1 className="px-20 py-10 text-3xl text-center">No item listed</h1><Info_2/></Fragment>)
  return (
    <Fragment>
      <Info_1/>
    <div className="flex justify-center">
 
      <div className="px-4" style={{ maxWidth: '1300px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border-8 shadow-2xl hover:drop-shadow-xl rounded-3xl overflow-hidden ">
                <img style={{ resizeMode: "cover",
                              height: 200,
                              width: 400
                            }}
                            src={nft.image} />
                <div className="pl-1 border-4 border-indigo-200 border-x-indigo-500">
                  <p style={{ height: '1px' }} className="text-lg text-center font-bold font-mono">{nft.name}</p>
                  <div style={{ height: '105px', overflow: 'hidden' }}>
                    <p className="text-gray-400 text-xs italic">{nft.description}</p>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-500 to-blue-700 ">
                  <p className="text-2xl font-bold text-white text-center">{nft.price} MATIC</p>
                  <button className="mt-4 w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>Buy</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>

    </div>
    
    <Info_2 />
    </Fragment>

  )
}
