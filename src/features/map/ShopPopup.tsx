'use client'

import './ShopPopup.css'
import { useEffect, useState, type FC } from 'react'
import Image from 'next/image'
import type { Shop } from '../../data/loaders'
import { assetUrl } from '../../lib/assetUrl'

interface ShopPopupProps {
  shop: Shop
  onClose: () => void
}

const ShopPopup: FC<ShopPopupProps> = ({ shop, onClose }) => {
  const imageSrc = assetUrl(`/images/${shop.image}`)
  const fallbackSrc = assetUrl('/images/placeholder-shop.png')
  const [currentSrc, setCurrentSrc] = useState(imageSrc)
  const organizationName = shop.organizationName ?? '未設定'
  const projectName = shop.projectName ?? shop.name

  useEffect(() => {
    setCurrentSrc(imageSrc)
  }, [imageSrc])

  return (
    <div className="shop-popup-overlay" onClick={onClose}>
      <div className="shop-popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="shop-popup-close" onClick={onClose}>
          ×
        </button>
        <Image
          src={currentSrc}
          alt={shop.name}
          width={1200}
          height={800}
          className="shop-popup-image"
          onError={() => {
            setCurrentSrc((prev) => (prev === fallbackSrc ? prev : fallbackSrc))
          }}
        />
        <div className="shop-popup-info">
          <h2>{projectName}</h2>
          <p className="shop-popup-organization">{organizationName}</p>
          <p className="shop-popup-description">{shop.description}</p>
        </div>
      </div>
    </div>
  )
}

export default ShopPopup

