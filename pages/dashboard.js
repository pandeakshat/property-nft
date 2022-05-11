/* pages/dashboard.js */
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
var authe = window.localStorage.getItem('auth')

export default function CreatorDashboard() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    const data = await contract.fetchItemsListed()

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
      }
      return item
    }))

    setNfts(items)
    setLoadingState('loaded') 
  }

  if(authe==0){ return(<div className="background bg2 flex justify-center"><body class="body_design" >

  <div class="head404"></div>

  <div class="txtbg404">

<div class="txtbox">

    <p class='font2' style={{fontSize:"18 px",}}>Not connected to Metamask</p>

    <p class="font-weight-bold paddingbox">Please connect and try again</p>


  </div>

</div>

</body></div>)}
  if(authe==1){  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No NFTs listed</h1>)
  return (
    <div>
      <div className="p-4">
        <h2 className="text-2xl py-2">Items Listed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (

              <div key={i} className="border-8 shadow-2xl hover:drop-shadow-xl rounded-3xl overflow-hidden ">
              <img style={{ resizeMode: "cover",
                            height: 200,
                            width: 400
                          }}
                          src={nft.image} />
              <div className="p-4 bg-gradient-to-r from-green-500 to-blue-700 ">
                <p className="text-2xl font-bold text-white text-center">Price - {nft.price} MATIC</p>
              </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
    
  }

}
