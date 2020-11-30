import { client } from "components/services/apiService";


const url = `${process.env.REACT_APP_API_URL_RESOURCE}/user_join_log`;


export async function add(YandN) {
  return await client.post({
    url: `${url}/add`,
    form: {
      is_join: YandN
    }
  })
}

export async function getChart() {
  return await client.post({
    url: `${url}/get_chart`,
    form: {}
  })
}

export default {
  add,
  getChart
};