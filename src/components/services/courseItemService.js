import { client } from "./apiService";


const url = `${process.env.REACT_APP_API_URL_RESOURCE}/course_item`;


//选择弹框数据
export async function get(i_itemID) {
  return await client.post({
    url: `${url}/get`,
    form: {
      id: i_itemID
    }
  });
}

// urlId url的参数id
export async function get_list(i_courseID , i_gradeList = undefined , offset = 0 , limit = 20 , sort , order, is_cache) {
  return await client.post({
    url: `${url}/get_list`,
    form:{
      course_id: i_courseID,
      grade : (Array.isArray(i_gradeList) ? i_gradeList.join(',') : i_gradeList),
      offset,
      limit,
      sort,
      order,
      is_cache
    }
  });
}

export async function remove(i_cItemID = null) {
    if(!i_cItemID) {
        return;
    }
    return client.post({
        url : `${url}/delete`,
        form : {
            id : i_cItemID 
        }
    });
}

export default {
  get,
  get_list,
  remove
};
