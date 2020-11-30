import { client } from "./apiService";


const url = `${process.env.REACT_APP_API_URL_RESOURCE}/user_favourite`;

//获取数据列表
export async function getList(offset=0, limit=10) {
  return await client.post({
    url: `${url}/get_list`,
    form: {
      offset,
      limit
    }
  });
}

//删除星星
export async function starDelete(res_id) {
  return await client.post({
    url: `${url}/delete`,
    form: {
      res_id
    }
  });
}

//增加星星
export async function starAdd(res_id) {
  return await client.post({
    url: `${url}/add`,
    form: {
      res_id
    }
  });
}

export default {
  getList,
  starDelete,
  starAdd
};