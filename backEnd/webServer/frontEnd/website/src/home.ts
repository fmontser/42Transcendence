import {createWebSocket, closeWebSocket, ws, dictionaryWs} from './websocket.js';



export async function loadWebSocket() {
    const sessionResponse = await fetch(`https://${window.location.hostname}:8443/usermanagement/front/get/profile_session`, {
      method: 'GET',
      credentials: 'include'
    });
    const sessionData = await sessionResponse.json();
    const id = sessionData.name;


    createWebSocket(id);
}
