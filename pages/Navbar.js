import { useState } from "react"
import Link from 'next/link'


export default function Navbar() {
    const [isNavExpanded, setIsNavExpanded] = useState(false)
    return (

<nav className="navigation">
<p class="u-text_u-title_u-text-1">
Property NFT Marketplace
</p>
<button
  className="hamburger"
  onClick={() => {
    setIsNavExpanded(!isNavExpanded)
  }}
>
  {/* hamburger svg code... */}
</button>
<div
  className={
    isNavExpanded ? "navigation-menu expanded" : "navigation-menu"
  }
>
<ul> 
  <li>
    <Link href="/">
      <a class="u-text_u-title_u-text-1">
        Welcome
      </a>
    </Link>
  </li>
  <li>
  <Link href="/create-nft">
    <a class="u-text_u-title_u-text-1">
      List Properties
    </a>
  </Link>
  </li>
  <li>
  <Link href="/my-nfts">
    <a class="u-text_u-title_u-text-1">
      My Properties
    </a>
  </Link>
  </li>
  <li>
  <Link href="/dashboard">
    <a class="u-text_u-title_u-text-1">
      My Dashboard
    </a>
  </Link>
  </li>
</ul>
</div>
</nav>
    )
}