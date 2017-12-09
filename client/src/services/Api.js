import axios from 'axios';

export default(() => {
  // eslint-disable-next-line
  console.log('problem?');
  const url = axios.create({
    baseURL: 'http://localhost:8081/v1/',
  });
  return url;
});
