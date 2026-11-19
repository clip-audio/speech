// Each destination has its own media element; voice chat never falls back to speakers.
export async function routeOutput(player, deviceId, voiceChat = false) {
  player.pause();
  if (voiceChat && (!deviceId || deviceId === 'default')) throw Error('Select a dedicated voice-chat output, such as a virtual audio cable, first.');
  if (!player.setSinkId) {
    if (deviceId || voiceChat) throw Error('This browser cannot select audio outputs. Use a browser supporting setSinkId on localhost or HTTPS.');
    return;
  }
  try { await player.setSinkId(deviceId || ''); }
  catch { throw Error('Cannot use the selected output. Reconnect or authorize the device, then select it again. Playback was stopped.'); }
}
