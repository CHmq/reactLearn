import { client } from "./apiService";


const url = `${process.env.REACT_APP_API_URL_KID}/api/notice`;

export async function getList() {
  return await client.post({
    url: `${url}/get_list`,
    form: {
      page: 0,
      limit: 10
    }
  });
}

export default {
  getList
};