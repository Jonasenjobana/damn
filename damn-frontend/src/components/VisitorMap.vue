<template>
  <div class="visitor-map">
    <div id="visitor-map-container" ref="mapContainerRef"></div>
    <div v-if="!hasLocations" class="map-empty">
      <el-empty description="暂无访客位置数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { VisitorStats } from '@/api/modules/visitor'

const props = defineProps<{
  stats: VisitorStats | null
}>()

const mapContainerRef = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let markersLayer: L.LayerGroup | null = null

const hasLocations = computed(() => {
  return props.stats?.locations && props.stats.locations.length > 0
})

const initMap = () => {
  if (!mapContainerRef.value || map) return

  map = L.map(mapContainerRef.value, {
    center: [30, 105],
    zoom: 4,
    minZoom: 2,
    maxZoom: 18,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }).addTo(map)

  markersLayer = L.layerGroup().addTo(map)

  updateMarkers()
}

const updateMarkers = () => {
  if (!map || !markersLayer || !props.stats?.locations) return

  markersLayer.clearLayers()

  props.stats.locations.forEach(location => {
    const markerIcon = L.divIcon({
      html: `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
      className: 'custom-marker',
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    })

    const marker = L.marker([location.lat, location.lng], { icon: markerIcon })
      .bindPopup(`
        <div style="text-align: center;">
          <strong>${location.city}</strong><br/>
          <span style="color: #666;">${location.country}</span><br/>
          <small style="color: #999;">${new Date(location.time).toLocaleString()}</small>
        </div>
      `)
      .addTo(markersLayer!)
  })

  if (props.stats.locations.length > 0) {
    const bounds = markersLayer.getBounds()
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.1), { maxZoom: 10 })
    }
  }
}

watch(() => props.stats, () => {
  updateMarkers()
}, { deep: true })

onMounted(() => {
  setTimeout(() => {
    initMap()
  }, 100)
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.visitor-map {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  background: #f5f7fa;
}

#visitor-map-container {
  width: 100%;
  height: 100%;
}

.map-empty {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
}

:deep(.custom-marker) {
  background: transparent;
  border: none;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
}

:deep(.leaflet-popup-content) {
  margin: 12px;
}
</style>
