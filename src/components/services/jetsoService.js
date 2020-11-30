import { client } from "./apiService";


const url = `${process.env.REACT_APP_API_URL_PD}/api/jetso`;

export async function getList() {
  return await client.post({
    url: `${url}/product/get_list`,
    form: {
      lang: 'zh',
      start: 0,
      cat: 'NEWEST'
    }
  });
}

export default {
  getList
};