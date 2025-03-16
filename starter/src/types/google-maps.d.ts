declare module '@vis.gl/react-google-maps' {
  import { ReactNode } from 'react';

  export interface APIProvider {
    children: ReactNode;
    apiKey: string;
  }

  export interface MapProps {
    children?: ReactNode;
    zoom?: number;
    center?: google.maps.LatLngLiteral;
    onClick?: (e: google.maps.MapMouseEvent) => void;
    onIdle?: (map: google.maps.Map) => void;
  }

  export function APIProvider(props: APIProvider): JSX.Element;
  export function Map(props: MapProps): JSX.Element;
  export function useMap(): google.maps.Map | undefined;
} 