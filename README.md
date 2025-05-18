# Elephant Drawing 3D Experience

Een interactieve webapplicatie waarmee gebruikers een olifant tekening kunnen inkleuren, vastleggen met hun camera, en als 3D-model tot leven zien komen.

## Projectoverzicht

Deze applicatie combineert tekenen met moderne 3D/AR-technologie:

- Downloadbaar olifant template
- Camera-opname van ingekleurde tekeningen
- 3D-visualisatie van de ingekleurde olifant

## Technische Implementatie

### Frontend
- Vier hoofdschermen: Introductie, Camera, Verwerking en 3D-resultaat
- Modulaire opbouw met vanilla JavaScript, HTML en CSS

### Camera en 3D-rendering
- Camera-toegang via MediaDevices API
- 3D-rendering met Three.js en GLTF-modellen
- Interactieve controle met OrbitControls
- Dynamische textuurmapping van gebruikerstekeningen

## Tools en Onderbouwing

| Technologie | Onderbouwing |
|------------|---------------|
| **Three.js** | Industriestandaard voor WebGL met uitstekende documentatie |
| **GLTFLoader** | Efficiënt formaat voor 3D-modellen, web-geoptimaliseerd |
| **OrbitControls** | Intuïtieve gebruikersbesturing met minimale ontwikkelingsinspanning |
| **Canvas API** | Native browser-API voor efficiënte beeldverwerking |
| **MediaDevices API** | Standaard web-API voor cameratoegang |

## Installatie en Test

### Vereisten
- Moderne webbrowser met WebGL en camera-ondersteuning

### Testen met VS Code
1. Clone de repository
2. Open het project in Visual Studio Code
3. Installeer de "Live Server" extensie als je deze nog niet hebt
4. Klik rechts onder in VS Code op "Go Live" om de applicatie te starten
5. Geef toestemming voor cameragebruik wanneer hierom wordt gevraagd
