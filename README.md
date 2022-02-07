# Helpotus lähelläsi

Vessat listattuna lähelläsi


## Tiedostohierarkia

Tiedostot tallennetaan oikeisiin paikkoihin jne.

### CSS tiedostojen hierarkia

Kaikki css tiedostot `/style` kansioon
- `global.css` tyylit kaikille sivuille
    - `theme.css` teeman värit
- muut `css` tiedostot sivukohtaisia

### JS tiedostojen hierarkia

Kaikki js tiedostot `/modules` kansioon
- api
    - rajapintojen kanssa keskustelu
- location
    - paikkatietojen haku ja käsittely
- map
    - kartat, leaflet.js kanssa keskustelu
- tests
    - paikka kaikille random testifunktioille

### Kolmannen osapuolen tiedostot

Kaikki kolmannen osapuolen moduulit `/vendor` kansioon
- leaflet
    - Karttamoduuli

## Käytettävät APIt
- [Helsingin kaupungin yleisövessat](https://api.hel.fi/servicemap/v2/unit/?page=1&page_size=200&only=street_address%2Clocation%2Cname%2Cmunicipality%2Caccessibility_shortcoming_count%2Cservice_nodes%2Ccontract_type&geometry=true&include=service_nodes%2Cservices%2Caccessibility_properties%2Cdepartment&service_node=94)
- [Openstreetmap vessat](https://overpass-api.de/api/interpreter?data=[out:json];node[%22amenity%22=%22toilets%22](around:10000,60.192059,%2024.945831);%20out%20meta;%20
)
- [HSL reititys](https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql)

## Git Commitit
Mielellään käytetään [semantic committeja](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716)