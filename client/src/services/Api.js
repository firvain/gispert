/* eslint quotes: ["error", "backtick"] */
import axios from 'axios';

export default(() => {
  axios.create({
    baseURL: `http://localhost:8081`,
  });
});
