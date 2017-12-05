import Api from '@/services/Api';

export default {
  register(credentials) {
    return Api().post('register', credentials);
  },
  login(credentials) {
    return Api().post('/v1/login', credentials);
  },
};

// how you call this from another file
// AuthenticationService.register({
//   email: "ytsampouris@gmail.com",
//   password: "test",
// });
