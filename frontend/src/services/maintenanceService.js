import api from './api';

const maintenanceService = {
  getAll: () =>
    api.get('/maintenance').then((res) => res.data),

  getById: (id) =>
    api.get(`/maintenance/${id}`).then((res) => res.data),

  log: (data) =>
    api.post('/maintenance/log', data).then((res) => res.data),

  update: (id, data) =>
    api.put(`/maintenance/${id}`, data).then((res) => res.data),

  delete: (id) =>
    api.delete(`/maintenance/${id}`).then((res) => res.data),
};

export default maintenanceService;