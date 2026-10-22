import api from './api';

const driverService = {
  getAvailable: () =>
    api.get('/drivers/available').then((res) => res.data),
  getCurrentDriver: () =>
    api.get('/drivers/me').then((res) => res.data),
};

export default driverService;