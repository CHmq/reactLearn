import { client } from "./apiService";

const url = `${process.env.REACT_APP_API_URL_RESOURCE}/main`;
const url2 = `${process.env.REACT_APP_API_URL_ARTICLE}/user_comment`;
const articleUrl = `${process.env.REACT_APP_API_URL_ARTICLE}/main`;

export async function getClassList(id, type, keyword, offset = 0, limit = 12) {
  const data = await client.post({
    url: `${url}/get_list`,
    form: {
      cat: id,
      item_type: type,
      keyword: keyword,
      offset: offset,
      limit: limit,
    },
  });
  return data;
}

export async function add(value) {
  const data = await client.post({
    url: `${url}/add`,
    form: value,
  });
  console.log(data);
  return data;
}

export async function mainDelete(id) {
  const data = await client.post({
    url: `${url}/delete`,
    form: { id },
  });
  console.log(data);
  return data;
}

export async function update(value) {
  const data = await client.post({
    url: `${url}/update`,
    form: value,
  });
  console.log(data);
  return data;
}
// 获取课件详细的内容
export async function get(i_refID) {
  const data = await client.post({
    url: `${url}/get`,
    form: {
      id: i_refID,
    },
  });
  return data;
}

export async function getFullInfo(id) {
  return await client.post({
    url: `${url}/get_full_info`,
    form: {
      id,
    },
  });
}

// 获取当前校本资源的显示信息(不包含修改功能)
export async function getFullDisplayInfo(id) {
  return await client.post({
    url: `${url}/get_full_display_info `,
    form: {
      id,
    },
  });
}

// 更改順序
export async function updateSort(id, items) {
  return await client.post({
    url: `${url}/update_sort `,
    form: {
      id,
      items
    },
  });
}

//ArticleInfo獲取文章  api
export async function getDisplay(id, region, lang) {
  const data = await client.post({
    url: `${articleUrl}/get_display`,
    form: {
      region,
      lang,
      id,
    },
  });
  return data;
}
//ArticleInfo提交答案  api
export async function addrecord(region, type, value, id) {
  const data = await client.post({
    url: `${articleUrl}/add_record`,
    form: {
      region,
      id,
      type,
      value,
    },
  });
  return data;
}

export async function getCeoPeriod(region) {
  const data = await client.post({
    url: `${articleUrl}/get_ceo_period`,
    form: {
      region,
    },
  });
  return data;
}

//ArticleInfo提交評論  api
export async function addList(region, comment, id) {
  const data = await client.post({
    url: `${url2}/add`,
    form: {
      region,
      article_id: id,
      comment,
    },
  });
  return data;
}

//ArticleInfo獲取評論列表  api
export async function getList(region, id, offset, limit) {
  const data = await client.post({
    url: `${url2}/get_list`,
    form: {
      region,
      article_id: id,
      offset,
      limit,
    },
  });
  return data;
}

//article
export async function getMenu(region, lang) {
  return await client.post({
    url: `${articleUrl}/get_menu`,
    form: {
      region,
      lang,
    },
  });
}

export async function getDisplayList(region, lang, num, limit = 12) {
  return await client.post({
    url: `${articleUrl}/get_display_list`,
    form: {
      region,
      lang,
      offset: num,
      limit,
      is_ceo: region != "my" ? "Y" : "",
      menu: "",
    },
  });
}
// 学校封面上传
export async function setDefaultPreviewImg(id, bg_id) {
  return await client.post({
    url: `${url}/update_bg`,
    form: {
      id,
      bg_id,
    },
  });
}

export default {
  getClassList,
  add,
  mainDelete,
  update,
  get,
  getFullInfo,
  getDisplay,
  addList,
  getList,
  addrecord,
  getMenu,
  getDisplayList,
  getCeoPeriod,
  getFullDisplayInfo,
  updateSort
};
