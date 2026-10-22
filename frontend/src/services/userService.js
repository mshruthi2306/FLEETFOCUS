import api from './api';

const userService = {
  getTechnicians: () =>
    api.get('/users/technicians').then((res) => res.data),
};

export default userService;