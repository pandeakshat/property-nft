/* pages/my-nfts.js */
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'

import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
var authe = window.localStorage.getItem('auth')

export default function MyAssets() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const router = useRouter()
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const marketplaceContract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    const data = await marketplaceContract.fetchMyNFTs()

    const items = await Promise.all(data.map(async i => {
      const tokenURI = await marketplaceContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenURI)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        tokenURI
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded') 
  }
  function listNFT(nft) {
    router.push(`/resell-nft?id=${nft.tokenId}&tokenURI=${nft.tokenURI}`)
  }

  if(authe==0)return( <div className="background bg2 flex justify-center"><body class="body_design">

  <div class="head404"></div>

  <div class="txtbg404">

<div class="txtbox">

    <p class='font2' style={{fontSize:"18 px",}}>Not connected to Metamask</p>

    <p class="font-weight-bold paddingbox">Please connect and try again</p>


  </div>

</div>

</body></div>)
  if(authe==1){
    if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No NFTs owned</h1>)
    return (
      <div className="flex justify-center">
        <div className="p-4">
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
                  <button className="mt-4 w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-12 rounded" onClick={() => listNFT(nft)}>List</button>
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
