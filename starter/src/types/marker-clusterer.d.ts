declare module '@googlemaps/markerclusterer' {
  import { LatLng, LatLngLiteral, Map } from 'google.maps';

  export interface MarkerClustererOptions {
    map?: Map;
    markers?: google.maps.Marker[];
    algorithm?: Algorithm;
    renderer?: Renderer;
    onClusterClick?: (
      cluster: Cluster,
      map: Map
    ) => void;
  }

  export class MarkerClusterer {
    constructor(options: MarkerClustererOptions);
    addMarker(marker: google.maps.Marker, noDraw?: boolean): void;
    addMarkers(markers: google.maps.Marker[], noDraw?: boolean): void;
    removeMarker(marker: google.maps.Marker, noDraw?: boolean): boolean;
    removeMarkers(markers: google.maps.Marker[], noDraw?: boolean): boolean;
    clearMarkers(noDraw?: boolean): void;
    render(): void;
  }

  export interface Algorithm {
    calculate: (input: {
      markers: google.maps.Marker[];
      map: Map;
    }) => Cluster[];
  }

  export interface Cluster {
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
    markers: google.maps.Marker[];
    position: LatLng | LatLngLiteral;
  }

  export interface Renderer {
    render: (cluster: Cluster, stats: { markers: google.maps.Marker[]; clusters: Cluster[] }) => void;
  }

  export interface Marker extends google.maps.Marker {
    lat: number;
    lng: number;
  }
} 