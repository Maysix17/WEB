import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, LayersControl } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { zonasService } from '../../services/zonasService';
import { getZonaCultivosVariedadXZona } from '../../services/cultivosService';
import type { Zona } from '../../services/zonasService';
import type { Cultivo } from '../../types/cultivos.types';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapVisualizationProps {
  onZoneSelect?: (zone: Zona) => void;
  selectedZoneId?: string;
}

const MapVisualization: React.FC<MapVisualizationProps> = ({ onZoneSelect, selectedZoneId }) => {
  const [zones, setZones] = useState<Zona[]>([]);
  const [cropsData, setCropsData] = useState<Record<string, Cultivo[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const zonesData = await zonasService.getAll();
        setZones(zonesData);

        // Fetch crop data for each zone
        const cropsPromises = zonesData.map(async (zone) => {
          try {
            const crops = await getZonaCultivosVariedadXZona(zone.id);
            return { zoneId: zone.id, crops };
          } catch (err) {
            console.error(`Error fetching crops for zone ${zone.id}:`, err);
            return { zoneId: zone.id, crops: [] };
          }
        });

        const cropsResults = await Promise.all(cropsPromises);
        const cropsMap: Record<string, Cultivo[]> = {};
        cropsResults.forEach(({ zoneId, crops }) => {
          cropsMap[zoneId] = crops;
        });
        setCropsData(cropsMap);
      } catch (err) {
        console.error('Error fetching zones:', err);
        setError('Failed to load map data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleZoneClick = (zone: Zona) => {
    if (onZoneSelect) {
      onZoneSelect(zone);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading map...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-96 text-red-500">{error}</div>;
  }

  // Calculate center from zones or default
  const center: [number, number] = zones.length > 0
    ? [zones[0].coorY, zones[0].coorX]
    : [4.6097, -74.0817]; // Default to Bogotá

  return (
    <div className="w-full h-96 md:h-[500px] lg:h-[600px] relative">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg shadow-lg"
        aria-label="Interactive agricultural zones map"
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.arcgis.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay checked name="Zones">
            {zones.map((zone) => {
              if (!zone.coordenadas || !Array.isArray(zone.coordenadas)) return null;

              const positions: [number, number][] = zone.coordenadas.map((coord: any) => [
                coord.lat || coord.y || 0,
                coord.lng || coord.x || 0,
              ]);

              const isSelected = selectedZoneId === zone.id;

              return (
                <Polygon
                  key={zone.id}
                  positions={positions}
                  pathOptions={{
                    color: isSelected ? '#ff0000' : '#3388ff',
                    weight: isSelected ? 3 : 2,
                    opacity: 0.8,
                    fillOpacity: 0.3,
                  }}
                  eventHandlers={{
                    click: () => handleZoneClick(zone),
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold">{zone.nombre}</h3>
                      <p>Type: {zone.tipoLote}</p>
                      <p>Area: {zone.areaMetrosCuadrados} m²</p>
                      {cropsData[zone.id] && cropsData[zone.id].length > 0 && (
                        <div>
                          <h4 className="font-semibold mt-2">Crops:</h4>
                          <ul className="list-disc list-inside">
                            {cropsData[zone.id].map((crop) => (
                              <li key={crop.cvzid}>{crop.nombrecultivo} - {crop.tipoCultivo?.nombre || 'Unknown'}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </Popup>
                </Polygon>
              );
            })}
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Sensor Markers">
            {zones.map((zone) => {
              if (!zone.coorX || !zone.coorY) return null;

              return (
                <Marker
                  key={`sensor-${zone.id}`}
                  position={[zone.coorY, zone.coorX]}
                  icon={new Icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                  })}
                >
                  <Popup>
                    <div className="p-2">
                      <h4 className="font-bold">Sensor - {zone.nombre}</h4>
                      <p>Zone: {zone.nombre}</p>
                      {zone.mqttConfig && (
                        <p>MQTT: {zone.mqttConfig.nombre}</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>
    </div>
  );
};

export default MapVisualization;