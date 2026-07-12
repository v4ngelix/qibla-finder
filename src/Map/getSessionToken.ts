import { googleMapsAPIKey } from './constants';
import simplifiedRoadmapStyle from "./simplifiedRoadmapStyle";

type SessionTokenRequestResponse = {
  session: string,
  expiry: string,
  tileWidth: number,
  tileHeight: number,
  imageFormat: 'png' | 'jpg',
}

export type SessionTokens = {
  satellite: string,
  roadmap: string,
  minimap: string,
}

function fetchSessionToken(mapType: 'satellite' | 'roadmap' | 'minimap'): Promise<SessionTokenRequestResponse> {
  return fetch(
    `https://tile.googleapis.com/v1/createSession?key=${googleMapsAPIKey}`, {
      method: 'POST',
      body: JSON.stringify({
        mapType: mapType === 'minimap' ? 'roadmap' : mapType,
        language: 'en-US',
        region: 'US',
        layerTypes: mapType === 'satellite' ? ['layerRoadmap'] : [],
        ...(mapType === 'minimap' ? {
          styles: simplifiedRoadmapStyle
        } : {})
      })
    }
  ).then(res => res.json());
}

function getSessionTokens(): Promise<SessionTokens> {
  return Promise.all([
    fetchSessionToken('satellite'),
    fetchSessionToken('roadmap'),
    fetchSessionToken('minimap'),
  ]).then(([ satelliteResponse, roadmapResponse, minimapResponse ]): SessionTokens => ({
    satellite: satelliteResponse.session,
    roadmap: roadmapResponse.session,
    minimap: minimapResponse.session,
  }));
}

export default getSessionTokens;