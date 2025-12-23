# Helpotus lähelläsi

Vessat listattuna lähelläsi

Tehty osana Metropolia ammattikorkeakoulun web-tekniikat ja digitaalinen media -kurssia

## Käytettävät APIt

-   [Openstreetmap vessat](<https://overpass-api.de/api/interpreter?data=[out:json];node[%22amenity%22=%22toilets%22](around:10000,60.192059,%2024.945831);%20out%20meta;%20>)
-   [HSL reititys](https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql)
-   [Openrouteservice reititys](https://api.openrouteservice.org/v2/directions/foot-walking?api_key=5b3ce3597851110001cf62489ed94340f9f94cd7986b548f20950a89&)
-   [Openstreetmap sijantihaku](https://nominatim.openstreetmap.org/search/)
-   [Paikkatiedon osoitteen haku](https://api.opencagedata.com/geocode/v1/)

# Kehittämiseen

## Git Commitit

Käytetään mielellään [semantic committeja](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716)

## Tiedostohierarkia

Tiedostot tallennetaan oikeisiin paikkoihin jne.

### CSS tiedostojen hierarkia

Kaikki css tiedostot `/style` kansioon

-   `global.css` tyylit kaikille sivuille
    -   `theme.css` teeman värit
-   muut `css` tiedostot sivukohtaisia

### JS tiedostojen hierarkia

Kaikki js tiedostot `/modules` kansioon

#### Päätiedostot

Modules kansion juureen päätiedostot (esim index.js on pääsovelluksen scripti, search.js hakusivun scripti)

#### Kansiot

-   app
    -   Pääsovellussivun logiikka
    -   Käyttäen Javascript Class -syntaksia
    -   import {App} -> new App({location})
-   api
    -   rajapintojen kanssa keskustelu
        -   hsl
            -   routing.js - Hsl reitit
        -   osm
            -   restrooms.js - overpass-api vessojen haku openstreetmap datasta
            -   routing.js - openrouteservice reitit, kun hsl ei toimi
            -   search.js - nominatim api, osm sijaintien hakuum
        -   routereverse
            -   streetNameFromPosition.js - muuta sijainti osoitteeksi
-   location
    -   paikkatietojen haku ja käsittely
-   map
    -   kartat, leaflet.js kanssa keskustelu
-   layout
    -   "helper funktioita" html elementtien luomiseen
-   util
    -   Kaikennäköisiä funktioita
    -   fakedata.js sisältää testidataa
-   tests
    -   paikka kaikille random testifunktioille

#### Kolmannen osapuolen tiedostot

Kaikki kolmannen osapuolen moduulit `/vendor` kansioon

-   leaflet
    -   Karttamoduuli
-   polyline
    -   google polylinedatan dekoodaus

### Images

Kuvat

### Icons

Ikonit
