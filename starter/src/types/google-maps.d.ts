declare module '@vis.gl/react-google-maps' {
  import { ReactNode } from 'react';

  export interface APIProvider {
    children: ReactNode;
    apiKey: string;
    library?: string[];
    onLoad?: () => void;
  }

  export interface MapProps {
    children?: ReactNode;
    zoom?: number;
    defaultZoom?: number;
    center?: google.maps.LatLngLiteral;
    defaultCenter?: google.maps.LatLngLiteral;
    onClick?: (e: google.maps.MapMouseEvent) => void;
    onIdle?: (map: google.maps.Map) => void;
    onCameraChanged?: (ev: { detail: MapCameraChangedEvent }) => void;
    mapId?: string;
  }

  export interface MapCameraChangedEvent {
    center: google.maps.LatLngLiteral;
    zoom: number;
    bounds: google.maps.LatLngBounds;
  }

  export interface AdvancedMarkerProps {
    position: google.maps.LatLngLiteral;
    onClick?: (e: google.maps.MapMouseEvent) => void;
    children?: ReactNode;
    clickable?: boolean;
    ref?: (marker: any) => void;
  }

  export interface Container {
    offsetWidth: number;
    offsetHeight: number;
  }

  export interface PinProps {
    scale?: number;
    background?: string;
    borderColor?: string;
    glyphColor?: string;
    children?: ReactNode;
  }

  export const APIProvider: (props: APIProvider) => JSX.Element;
  export const Map: (props: MapProps) => JSX.Element;
  export const AdvancedMarker: (props: AdvancedMarkerProps) => JSX.Element;
  export const useMap: () => google.maps.Map | undefined;
  export const useMapsLibrary: (library: string) => any;
  export const GoogleMapsContext: React.Context<any>;
  export function latLngEquals(a: google.maps.LatLngLiteral, b: google.maps.LatLngLiteral): boolean;
  export const Pin: (props: PinProps) => JSX.Element;
} 