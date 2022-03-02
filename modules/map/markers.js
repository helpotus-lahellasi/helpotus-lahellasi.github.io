import * as L from '../../vendor/leaflet/leaflet-src.esm.js'

// Export icons used in the project

const iconBase = {
    iconSize: [32, 32],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
}

export const icons = {
    moneyRestroom: new L.Icon({
        ...iconBase,
        iconUrl: './images/markers/paid-marker.png',
        shadowUrl: './images/markers/user-marker-shadow.png',
    }),
    userMarker: new L.Icon({
        ...iconBase,
        iconUrl: './images/markers/user-marker.png',
        shadowUrl: './images/markers/toilet-marker-shadow.png',
    }),
    freeRestroom: new L.Icon({
        ...iconBase,
        iconUrl: './images/markers/free-marker.png',
        shadowUrl: './images/markers/toilet-marker-shadow.png',
    }),
    unknownFeeRestroom: new L.Icon({
        ...iconBase,
        iconUrl: './images/markers/unknown-marker.png',
        shadowUrl: './images/markers/toilet-marker-shadow.png',
    }),
}
