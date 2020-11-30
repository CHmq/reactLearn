import { client } from "./apiService";


const url = `${process.env.REACT_APP_API_URL_RESOURCE}/user_comment`;
const recordUrl = `${process.env.REACT_APP_API_URL_RESOURCE}/user_record`;

export async function Comment(offset, limit, urlId) {
  return await client.post({
    url: `${url}/get_list`,
    form: {
      course_id: urlId,
      offset: offset,
      limit: limit
    }
  });
}

export async function PopupMessageAdd(id, text, num) {
  return await client.post({
    url: `${url}/add`,
    form: {
      app_type: "KID_WEB",
      course_id: id,
      comment: text,
      star: num
    }
  });
}

//验证上载api
export async function VerifyUplaod(id, course_id) {
  return await client.post({
    url: `${recordUrl}/get_by_res_id`,
    form: {
      res_id: id,
      course_id
    }
  });
}
//上载api
export async function Uplaod(urlId, res_id, file) {
  return await client.post({
    url: `${recordUrl}/add`,
    form: {
      course_id: urlId,
      res_id,
      file,
      app_type: "KID_WEB"
    }
  });
}

//重新上载api
export async function ReUplaod(urlId, res_id, file, id) {
  return await client.post({
    url: `${recordUrl}/update`,
    form: {
      course_id: urlId,
      res_id,
      file,
      id,
      app_type: "KID_WEB"
    }
  });
}

export default {
  Comment,
  PopupMessageAdd,
  VerifyUplaod,
  Uplaod,
  ReUplaod
};
