import Api from '@/services/Api';

export default {
  register(credentials) {
    // eslint-disable-next-line
    console.log('credentials in auth service', credentials);
    return Api().post('users', credentials);
  },
  login(credentials) {
    return Api().post('login', credentials);
  },
};

// how you call this from another file
// AuthenticationService.register({
//   email: "ytsampouris@gmail.com",
//   password: "test",
// });
