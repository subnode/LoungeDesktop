import * as ipc from './lib/ipc';
import storeActiveRoutes from './stores/storeActiveRoutes';


ipc.on('#send', (data, event_) => {
  const destinations = (Array.isArray(data.to) ? data.to : [data.to])
    .map(toPath => storeActiveRoutes.getIdByRoute(toPath))
    .filter(x => x != null);

  ipc.send(data.channel, data.data, destinations);
});

ipc.on('#broadcast', (data, event_) => {
  const excludes = (Array.isArray(data.exclude) ? data.exclude : [data.exclude])
    .map(toPath => storeActiveRoutes.getIdByRoute(toPath))
    .filter(x => x != null);

  ipc.send(data.channel, data.data, excludes);
});
