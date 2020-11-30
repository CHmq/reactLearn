import { client } from "./apiService";


const url = `${process.env.REACT_APP_API_URL_KID}/api/hot_news`;

export async function newsList() {
  return await client.post({
    url: `${url}/news_list`,
    form: {
      page: 0,
      limit: 10
    }
  });
}

export async function newsDetail(id) {
  return await client.post({
    url: `${url}/news_detail`,
    form: {
      id
    }
  });
}

export default {
  newsList,
  newsDetail
};