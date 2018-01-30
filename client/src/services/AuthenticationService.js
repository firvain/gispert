import Api from '@/services/Api';

export default {
  register(credentials) {
    // console.log('credentials in auth service', credentials);
    return Api().post('register', credentials);
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
