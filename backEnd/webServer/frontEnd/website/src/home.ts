import {createWebSocket, closeWebSocket, ws, dictionaryWs} from './websocket.js';
import { startAnimation } from './background.js'


export async function init() {
    // const sessionResponse = await fetch(`https://${window.location.hostname}:8443/usermanagement/front/get/profile_session`, {
    //   method: 'GET',
    //   credentials: 'include'
    // });
    // const sessionData = await sessionResponse.json();
    // const id = sessionData.name;


    // createWebSocket(id);
    startAnimation();
}