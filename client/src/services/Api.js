import axios from 'axios';

export default(() => {
  // console.log('problem?');
  const url = axios.create({
    baseURL: 'https://localhost:8081/v1/',
  });
  return url;
});
