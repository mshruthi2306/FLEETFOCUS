import api from './api';

const tripService = {
  getAll: () =>
    api.get('/trips').then((res) => res.data),

  start: (data) =>
    api.post('/trips/start', data).then((res) => res.data),

  end: (id, distance) =>
    api.put(`/trips/${id}/end`, { distance }).then((res) => res.data),
};

export default tripService;