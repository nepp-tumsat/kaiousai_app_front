'use client'

import dynamic from 'next/dynamic'

const MapFeature = dynamic(() => import('@/features/map/Map'), {
  ssr: false,
})

export default function MapPage() {
  return <MapFeature />
}

