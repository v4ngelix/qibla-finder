import GoogleAPIKey from "./GoogleAPIKey";

export type SessionTokenRequestResponse = {
  "session": string,
  "expiry": string,
  "tileWidth": number,
  "tileHeight": number,
  "imageFormat": "png" | "jpg",
}

function getSessionToken(): Promise<SessionTokenRequestResponse> {
  return fetch(
    `https://tile.googleapis.com/v1/createSession?key=${ GoogleAPIKey }`, {
      method: 'POST',
      body: JSON.stringify({
        mapType: "satellite",
        language: "en-US",
        region: "US",
        layerTypes: ["layerRoadmap"]
      })
    }
  ).then(res => res.json());
}

export default getSessionToken;
