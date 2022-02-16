import * as L from '../../vendor/leaflet/leaflet-src.esm.js'

const iconBase = {
    iconSize: [32, 32],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
}

export const icons = {
    red: new L.Icon({
        ...iconBase,
        iconUrl: 'https://pennane.github.io/web-tekniikat-projekti/icons/favicon-32x32.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    }),
    black: new L.Icon({
        ...iconBase,
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    }),
    green: new L.Icon({
        ...iconBase,
        iconUrl: 'https://pennane.github.io/web-tekniikat-projekti/icons/favicon-32x32.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    }),
    gold: new L.Icon({
        ...iconBase,
        iconUrl: 'https://pennane.github.io/web-tekniikat-projekti/icons/favicon-32x32.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    })

}