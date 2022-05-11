/* pages/create-nft.js */
import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')


import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const router = useRouter()
  var authe = window.localStorage.getItem('auth')
  console.log(authe)
  async function onChange(e) {
    /* upload image to IPFS */
    const file = e.target.files[0]
    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      setFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }
  async function uploadToIPFS() {
    const { name, description, price } = formInput
    if (!name || !description || !price || !fileUrl) return
    /* first, upload metadata to IPFS */
    const data = JSON.stringify({
      name, description, image: fileUrl
    })
    try {
      const added = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      /* after metadata is uploaded to IPFS, return the URL to use it in the transaction */
      return url
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }

  async function listNFTForSale() {
    const url = await uploadToIPFS()
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    /* create the NFT */
    const price = ethers.utils.parseUnits(formInput.price, 'ether')
    let contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()
    let transaction = await contract.createToken(url, price, { value: listingPrice })
    await transaction.wait()

    router.push('/')
  }

  if(authe==0){ return( <div className="background bg2 flex justify-center"><body class="body_design">

  <div class="head404"></div>

  <div class="txtbg404">

<div class="txtbox">

    <p class='font2' style={{fontSize:"18 px",}}>Not connected to Metamask</p>

    <p class="font-weight-bold paddingbox">Please connect and try again</p>


  </div>

</div>

</body></div>)}
  if(authe==1){  
    return (
      <div className="flex justify-center bg-black">
      <div class="Card">
      <div class="input-container ic1">
        <input id="AssetName" class="input" type="text" placeholder=" "
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
        />
          <div class="cut"></div>
          <label for="AssetName" class="placeholder">Asset Name</label>
        </div>

        <div class="input-container ic1">
          <textarea id="Description" class="input" type="text" placeholder=" " 
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
          />
          <div class="cut"></div>
          <label for="Description" class="placeholder">Asset Description</label>
        </div>

        <div class="input-container ic2">
          <input id="Price" class="input" type="text" placeholder=" " 
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
          />
          <div class="cut"></div>
          <label for="Price" class="placeholder">Asset Price in MATIC</label>
        </div>

        
        <input
          type="file"
          name="Asset"
          className="my-5 rounded"
          onChange={onChange}
        />
        {
          fileUrl && (
            <img className="rounded mt-4" width="350" src={fileUrl} />
          )
        }
        <button onClick={listNFTForSale} className="font-bold mt-4 bg-black hover:bg-gray-800 text-white rounded p-4 shadow-lg">
          Create NFT
        </button>
      </div>
    </div>
  )

  }

}
