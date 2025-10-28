import React, { useState, useRef } from "react";
import TextInput from "../atoms/TextInput";
import CustomButton from "../atoms/Boton";
import { zonaService } from "../../services/zonaService";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface ZonaFormProps {
  onClose: () => void;
  onSave: () => void;
}

const ZonaForm: React.FC<ZonaFormProps> = ({ onClose, onSave }) => {
  const [zonaData, setZonaData] = useState({
    nombre: "",
    tipoLote: "",
    coorX: 0,
    coorY: 0,
    coordenadas: null as any,
    fkMapaId: undefined, // Sin mapa por defecto
  });
  const [message, setMessage] = useState<string>("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState<'point' | 'polygon'>('point');

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polygonRef = useRef<L.Polygon | null>(null);
  const drawingPointsRef = useRef<L.LatLng[]>([]);

  React.useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      maxZoom: 18,
      minZoom: 12,
    }).setView([1.8920, -76.0890], 16);

    // Remove attribution
    map.attributionControl.remove();

    // Add tile layers
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: ''
    });

    satelliteLayer.addTo(map);

    // Add layer control
    L.control.layers({
      'Mapa': osmLayer,
      'Satelital': satelliteLayer
    }).addTo(map);

    // Add click handler for drawing
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (!isDrawing) return;

      if (drawingMode === 'point') {
        // Remove existing marker
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }

        // Add new marker
        const marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
        markerRef.current = marker;

        setZonaData(prev => ({
          ...prev,
          coorX: e.latlng.lng,
          coorY: e.latlng.lat,
          coordenadas: null
        }));
      } else if (drawingMode === 'polygon') {
        drawingPointsRef.current.push(e.latlng);

        // Remove existing polygon
        if (polygonRef.current) {
          map.removeLayer(polygonRef.current);
        }

        // Draw polygon if we have at least 3 points
        if (drawingPointsRef.current.length >= 3) {
          const polygon = L.polygon(drawingPointsRef.current, {
            color: 'blue',
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.1,
          }).addTo(map);
          polygonRef.current = polygon;

          setZonaData(prev => ({
            ...prev,
            coordenadas: drawingPointsRef.current.map(p => ({ lat: p.lat, lng: p.lng }))
          }));
        }
      }
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isDrawing, drawingMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que se haya seleccionado una ubicación
    if (zonaData.coorX === 0 && zonaData.coorY === 0) {
      setMessage("Debe seleccionar una ubicación en el mapa");
      return;
    }

    // Preparar datos para enviar
    const dataToSend: any = {
      nombre: zonaData.nombre,
      tipoLote: zonaData.tipoLote,
      coorX: zonaData.coorX,
      coorY: zonaData.coorY,
      coordenadas: zonaData.coordenadas,
    };

    if (zonaData.fkMapaId) {
      dataToSend.fkMapaId = zonaData.fkMapaId;
    }

    console.log('Datos a enviar:', dataToSend);

    try {
      const response = await zonaService.create(dataToSend);
      console.log('Respuesta del servidor:', response);
      setMessage("Zona registrada exitosamente");
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error creating zona:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setMessage(`Error al registrar la zona: ${error.response?.data?.message || error.message}`);
    }
  };

  const toggleDrawing = () => {
    setIsDrawing(!isDrawing);
    if (!isDrawing) {
      // Clear existing drawings when starting to draw
      if (markerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      if (polygonRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(polygonRef.current);
        polygonRef.current = null;
      }
      drawingPointsRef.current = [];
    }
  };

  const clearDrawing = () => {
    if (markerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    if (polygonRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(polygonRef.current);
      polygonRef.current = null;
    }
    drawingPointsRef.current = [];
    setZonaData(prev => ({
      ...prev,
      coorX: 0,
      coorY: 0,
      coordenadas: null
    }));
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            label="Nombre de la Zona"
            placeholder="Ingrese nombre de la zona"
            value={zonaData.nombre}
            onChange={(e) => setZonaData({ ...zonaData, nombre: e.target.value })}
          />

          <div className="flex flex-col gap-2">
            <label className="text-gray-700 text-sm font-medium">Tipo de Lote</label>
            <select
              className="w-full h-9 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={zonaData.tipoLote}
              onChange={(e) => setZonaData({ ...zonaData, tipoLote: e.target.value })}
              required
            >
              <option value="">Seleccionar tipo</option>
              <option value="LOTE1">Lote 1</option>
              <option value="LOTE2">Lote 2</option>
              <option value="LOTE3">Lote 3</option>
            </select>
          </div>
        </div>

        {/* Drawing Controls */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-700 text-sm font-medium">Ubicación en el Mapa</label>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setDrawingMode('point')}
              className={`px-3 py-1 rounded text-sm ${drawingMode === 'point' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Punto
            </button>
            <button
              type="button"
              onClick={() => setDrawingMode('polygon')}
              className={`px-3 py-1 rounded text-sm ${drawingMode === 'polygon' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Polígono
            </button>
            <button
              type="button"
              onClick={toggleDrawing}
              className={`px-3 py-1 rounded text-sm ${isDrawing ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {isDrawing ? 'Detener Dibujo' : 'Iniciar Dibujo'}
            </button>
            <button
              type="button"
              onClick={clearDrawing}
              className="px-3 py-1 rounded text-sm bg-red-500 text-white"
            >
              Limpiar
            </button>
          </div>
          <div className="text-xs text-gray-600">
            {drawingMode === 'point' && isDrawing && "Haz clic en el mapa para colocar un punto"}
            {drawingMode === 'polygon' && isDrawing && "Haz clic en varios puntos para dibujar un polígono"}
            {!isDrawing && "Activa el modo dibujo para interactuar con el mapa"}
          </div>
        </div>

        {/* Map */}
        <div className="w-full h-96 border border-gray-300 rounded-md overflow-hidden">
          <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
        </div>

        {/* Coordinates Display */}
        {(zonaData.coorX !== 0 || zonaData.coorY !== 0) && (
          <div className="text-sm text-gray-600">
            Coordenadas: Lat {zonaData.coorY.toFixed(6)}, Lng {zonaData.coorX.toFixed(6)}
          </div>
        )}

        {message && <p className="text-center text-red-500">{message}</p>}

        <div className="flex gap-2 justify-end">
          <CustomButton
            type="button"
            text="Cancelar"
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2"
          />
          <CustomButton
            type="submit"
            text="Registrar Zona"
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2"
          />
        </div>
      </form>
    </div>
  );
};

export default ZonaForm;