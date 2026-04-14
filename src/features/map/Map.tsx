'use client'

import './Map.css'
import { useEffect, useRef, useState } from 'react'
import { CircleMarker, ImageOverlay, MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { getShops, type Shop, type ShopCategory } from '../../data/loaders'
import { assetUrl } from '../../lib/assetUrl'
import ShopPopup from './ShopPopup'

// Leaflet デフォルトアイコン（バンドラ用パッチ）
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Leaflet の型定義に _getIconUrl が無い
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: assetUrl('/images/map/leaflet/marker-icon-2x.png'),
  iconUrl: assetUrl('/images/map/leaflet/marker-icon.png'),
  shadowUrl: assetUrl('/images/map/leaflet/marker-shadow.png'),
})

function CurrentLocationButton({
  onLocationUpdate,
}: {
  onLocationUpdate?: (lat: number, lng: number) => void
}) {
  const handleClick = () => {
    if (!navigator.geolocation) {
      alert('このブラウザでは現在地を取得できません。')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        if (onLocationUpdate) {
          onLocationUpdate(latitude, longitude)
        }
      },
      () => {
        alert('現在地を取得できませんでした。位置情報の許可を確認してください。')
      },
    )
  }
  return (
    <button className="current-location-button" onClick={handleClick}>
      📍 現在地取得
    </button>
  )
}

function CampusSvgOverlay() {
  const svgBounds: L.LatLngBoundsExpression = [
    [35.66432, 139.78905],
    [35.669875, 139.796872],
  ]

  const imageUrl = assetUrl('/images/map/campus-map.png')

  return (
    <ImageOverlay
      url={imageUrl}
      bounds={svgBounds}
      opacity={1}
      zIndex={500}
    />
  )
}

function ZoomIndicator() {
  const [zoom, setZoom] = useState<number>(16)

  useMapEvents({
    zoomend(e) {
      setZoom(e.target.getZoom())
    },
    load(e) {
      setZoom(e.target.getZoom())
    },
  })

  return <div className="zoom-indicator">{zoom}</div>
}

export default function MapFeature() {
  const [isMapReady, setIsMapReady] = useState(false)
  const [shops] = useState<Shop[]>(() => getShops())
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [viewMode, setViewMode] = useState<'outdoor' | 'indoor'>('outdoor')
  const markerRefs = useRef<Record<number, L.Marker | null>>({})

  useEffect(() => {
    setIsMapReady(true)
  }, [])

  useEffect(() => {
    if (!isMapReady) return
    const refs = markerRefs.current
    const timer = setTimeout(() => {
      Object.values(refs).forEach((marker) => {
        if (marker) {
          marker.openPopup()
        }
      })
    }, 0)
    return () => clearTimeout(timer)
  }, [isMapReady])

  const getCategoryColor = (category: ShopCategory) => {
    switch (category) {
      case 'food':
        return '#ff7043'
      case 'stage':
        return '#ab47bc'
      case 'facility':
        return '#42a5f5'
      case 'experience':
      default:
        return '#66bb6a'
    }
  }

  const filteredShops = shops

  return (
    <div className="map-container">
      <div className="map-mode-toggle">
        <button
          type="button"
          className={`map-mode-button ${viewMode === 'outdoor' ? 'active' : ''}`}
          onClick={() => setViewMode('outdoor')}
        >
          屋外マップ
        </button>
        <button
          type="button"
          className={`map-mode-button ${viewMode === 'indoor' ? 'active' : ''}`}
          onClick={() => setViewMode('indoor')}
        >
          屋内マップ
        </button>
      </div>
      {isMapReady && (
        <MapContainer
          center={[35.667957411840746, 139.79262060541004]}
          zoom={16}
          maxZoom={19}
          style={{ height: '100%', width: '100%' }}
          closePopupOnClick={false}
        >
          <ZoomIndicator />
          {viewMode === 'outdoor' && (
            <>
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxNativeZoom={19}
                maxZoom={19}
                opacity={0.4}
              />
              <CampusSvgOverlay />
            </>
          )}
          {viewMode === 'indoor' && <CampusSvgOverlay />}
          {filteredShops.map((shop) => (
            <Marker
              key={shop.id}
              position={shop.location}
              ref={(marker) => {
                if (marker) {
                  markerRefs.current[shop.id] = marker
                }
              }}
              eventHandlers={{
                click: () => setSelectedShop(shop),
              }}
              icon={
                shop.isNepp
                  ? L.divIcon({
                      className: 'nepp-marker-icon',
                      html: '<div class="nepp-marker-pulse"></div>',
                      iconSize: [24, 24],
                      iconAnchor: [12, 12],
                    })
                  : L.divIcon({
                      className: 'category-marker-icon',
                      html: `<div class="category-marker-dot" style="background-color:${getCategoryColor(shop.category)}"></div>`,
                      iconSize: [20, 20],
                      iconAnchor: [10, 10],
                    })
              }
            >
              <Popup autoClose={false} closeOnClick={false}>
                <div
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedShop(shop)}
                >
                  {shop.name}
                </div>
              </Popup>
            </Marker>
          ))}
          {viewMode === 'outdoor' && userLocation && (
            <>
              <CircleMarker
                center={userLocation}
                radius={10}
                pathOptions={{
                  color: 'red',
                  weight: 3,
                  fillColor: 'transparent',
                  fillOpacity: 0,
                }}
              >
                <Popup autoClose={false} closeOnClick={false}>
                  あなたの現在地
                </Popup>
              </CircleMarker>
              <CircleMarker
                center={userLocation}
                radius={4}
                pathOptions={{
                  color: 'red',
                  weight: 1,
                  fillColor: 'red',
                  fillOpacity: 1,
                }}
              />
            </>
          )}
          {viewMode === 'outdoor' && (
            <CurrentLocationButton
              onLocationUpdate={(lat, lng) => setUserLocation([lat, lng])}
            />
          )}
        </MapContainer>
      )}
      {selectedShop && (
        <ShopPopup shop={selectedShop} onClose={() => setSelectedShop(null)} />
      )}
    </div>
  )
}

