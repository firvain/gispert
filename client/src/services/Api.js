import axios from 'axios';

export default(() => {
  console.log('problem?');
  const url = axios.create({
    baseURL: 'http://localhost:8081/v1/',
  });
  return url;
});
