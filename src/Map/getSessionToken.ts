import { googleMapsAPIKey } from './constants';

export type SessionTokenRequestResponse = {
  session: string,
  expiry: string,
  tileWidth: number,
  tileHeight: number,
  imageFormat: 'png' | 'jpg',
}

function getSessionToken(mapType: 'satellite' | 'roadmap'): Promise<SessionTokenRequestResponse> {
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

export default getSessionToken;
