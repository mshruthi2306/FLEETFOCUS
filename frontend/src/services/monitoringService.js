import api from './api';

const monitoringService = {
  getLiveFleet: () =>
    api.get('/monitoring/live').then((res) => res.data),
};

export default monitoringService;