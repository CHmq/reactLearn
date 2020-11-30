import { client } from "./apiService";


const url = `${process.env.REACT_APP_API_URL_KID}/api/activity`;

export async function top() {
  return await client.post({
    url: `${url}/top`,
    form: {}
  });
}

export async function info(id) {
  return await client.post({
    url: `${url}/info`,
    form: {id}
  });
}

export default {
  top,
  info
};