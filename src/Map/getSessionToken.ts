import { googleMapsAPIKey } from './constants';

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
}

function fetchSessionToken(mapType: 'satellite' | 'roadmap'): Promise<SessionTokenRequestResponse> {
  return fetch(
    `https://tile.googleapis.com/v1/createSession?key=${googleMapsAPIKey}`, {
      method: 'POST',
      body: JSON.stringify({
        mapType,
        language: 'en-US',
        region: 'US',
        layerTypes: mapType === 'satellite' ? ['layerRoadmap'] : []
      })
    }
  ).then(res => res.json());
}

function getSessionTokens(): Promise<SessionTokens> {
  return Promise.all([
    fetchSessionToken('satellite'),
    fetchSessionToken('roadmap'),
  ]).then(([ satelliteResponse, roadmapResponse ]): SessionTokens => ({
    satellite: satelliteResponse.session,
    roadmap: roadmapResponse.session,
  }));
}

export default getSessionTokens;