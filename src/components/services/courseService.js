import { client } from "components/services/apiService";

const url = `${process.env.REACT_APP_API_URL_RESOURCE}`;

export async function getMenu(language, school_id) {
  return await client
    .post({
      url: `${url}/course/get_menu`,
    })
    .then((ret) => {
      return ret.rows;
    });
}

//探索彈出框api
export async function ExploratioList(offset, limit, urlId) {
  return await client.post({
    url: `${url}/user_record/get_list`,
    form: {
      course_id: urlId,
      offset,
      limit,
    },
  });
}

// urlId url的参数id
export async function get(urlId) {
  return await client.post({
    url: `${url}/course/get`,
    form: {
      id: urlId,
    },
  });
}

export async function getFullInfo(i_courseID = null) {
  return client
    .post({
      url: `${url}/course/get_full_info`,
      form: {
        id: i_courseID,
      },
    })
    .then((_ret) => {
      _ret.grade = _ret.grade.map((_grade) => {
        let __grade = _grade.split("-");
        return (
          `${__grade[1]}-${__grade[0]}` +
          (__grade.length > 2 ? `-${__grade[2]}` : "")
        );
      });
      return _ret;
    });
}

//新增課程
export async function getCourseList() {
  console.log("getCourseList");
  return await client.post({
    url: `${process.env.REACT_APP_API_URL_RESOURCE}/course/get_tag`,
    form: {},
  });
}

//新增課程子分類頁面數據
export async function search({
  tag = null,
  keyword = "",
  type = [],
  offset = 0,
  limit = 5,
  show_total = false,
  school_only = false,
  evi_only = false,
  lang,
  vo_lang,
  sort,
  order
}) {
  let _type = [].concat(
    ...type.map((_item) => {
      return _item.split(",");
    })
  );
  return await client
    .post({
      url: `${process.env.REACT_APP_API_URL_RESOURCE}/search`,
      form: {
        tag: tag,
        keyword: keyword || "",
        type: _type,
        offset: offset * limit,
        limit: limit,
        school_only: !!school_only ? "Y" : "N",
        evi_only: !!evi_only ? "Y" : "N",
        lang,
        vo_lang,
        sort,
        order,
      },
    })
    .then((ret) => {
      return !!show_total ? ret : ret.rows;
    })
    .catch((err) => {
      return !!show_total ? { total: 0, rows: [] } : [];
    });
}

export async function subClassTag(id) {
  console.log("get_sub_class");
  return await client.post({
    url: `${process.env.REACT_APP_API_URL_RESOURCE}/course/get_tag`,
    form: {
      id: id,
    },
  });
}

//新增课程
export async function courseAdd(form, item) {
  return await client.post({
    url: `${process.env.REACT_APP_API_URL_RESOURCE}/course/add`,
    form: {
      ...form,
      item,
    },
  });
}

//編輯課程
export async function courseUpdate(form, item) {
  return await client.post({
    url: `${process.env.REACT_APP_API_URL_RESOURCE}/course/update`,
    form: {
      ...form,
      item,
    },
  });
}
export async function titleTipUpdate(value, lang_id, noData) {
  let type = "update";
  if (lang_id !== "zh") {
    type = "update_lang";
    if (!!noData) type = "add_lang";
  }
  return await client.post({
    url: `${process.env.REACT_APP_API_URL_RESOURCE}/course/${type}`,
    form: {
      id: value.id,
      name: value.name,
      description: value.description,
      lang_id,
    },
  });
}

export async function remove(i_courseID = null) {
  return client.post({
    url: `${process.env.REACT_APP_API_URL_RESOURCE}/course/delete`,
    form: {
      id: i_courseID,
    },
  });
}

export async function uploadFile(_permit, file) {
  return client.uploadOSS(_permit, file);
}

export async function uploadBgFile(id, bg_id) {
  return client.post({
    url: `${url}/course/update_bg`,
    form: {
      id,
      bg_id,
    },
  });
}

//刪除影片
export async function resetFile(id, type) {
  return client.post({
    url: `${url}/course/reset_file`,
    form: {
      id,
      section: type,
    },
  });
}

export async function addComment(id, star, comment) {
  return client.post({
    url: `${url}/user_record_comment/add`,
    form: {
      ur_id: id,
      star,
      comment,
      app_type: "KID_WEB",
    },
  });
}

export async function getComment(id) {
  return client.post({
    url: `${url}/user_record_comment/get_list`,
    form: {
      ur_id: id,
    },
  });
}

export async function getNewsList() {
  return client.post({
    url: `${url}/news/get_list`,
    form: {
      offset: 0,
      limit: 20,
    },
  });
}

export async function getNews(id) {
  return client.post({
    url: `${url}/news/get`,
    form: {
      id,
    },
  });
}

export async function editNews({
  id,
  is_show,
  title,
  content,
  iframe_url,
  page,
  region,
  lang_id,
  no_data,
  res_id,
  course_id,
}) {
  let type = "add";
  if (!!id) {
    type = "update";
    if (!!lang_id && lang_id !== "zh") {
      type = !!no_data ? "add_lang" : "update_lang";
    }
  }
  return client.post({
    url: `${url}/news/${type}`,
    form: {
      id,
      is_show,
      title,
      content,
      iframe_url,
      page,
      region,
      lang_id,
      res_id,
      course_id,
    },
  });
}

export async function adapterBatchAdd(id, adapter_item) {
  return client.post({
    url: `${url}/item/adapter/batch_add`,
    form: {
      res_id: id,
      adapter_item
    },
  });
}

export async function healthCheck() {
  return client.post({
    url: `https://resource-service.evigarten.com/system/health_check`,
    form: {}
  });
}

export async function getResourceItemPermit(i_fileMeta, i_formData) {
  return getUploadPermit(
    "resource_item",
    "school_resource",
    i_fileMeta,
    i_formData
  );
}

export async function getResourcePermit(i_fileMeta, i_formData) {
  return getUploadPermit("resource", "course", i_fileMeta, i_formData);
}

// 校本资料上传图片 (封面)
export async function getSchoolResourcePermit(i_fileMeta, i_formData) {
  return getUploadPermit("school_resource", "cover", i_fileMeta, i_formData);
}

export async function getUserRecordAddPermit(i_fileMeta, i_formData) {
  return getUploadPermit("user_record", "add", i_fileMeta, i_formData);
}

export async function getUserRecordUpdatePermit(i_fileMeta, i_formData) {
  return getUploadPermit("user_record", "update", i_fileMeta, i_formData);
}

function getUploadPermit(i_controller, i_action, i_fileMeta, i_formData = {}) {
  var meta = {
    lastModified: i_fileMeta.lastModified,
    lastModifiedDate: i_fileMeta.lastModifiedDate,
    name: i_fileMeta.name,
    size: i_fileMeta.size,
    type: i_fileMeta.type,
  };
  const formData = Object.assign({}, { meta: meta }, i_formData);
  return client.post({
    url: `${url}/upload/token/${i_controller}/${i_action}`,
    form: formData,
  });
}

export default {
  getMenu,
  get,
  getFullInfo,
  getCourseList,
  subClassTag,
  ExploratioList,
  search,
  courseAdd,
  courseUpdate,
  remove,
  uploadFile,
  uploadBgFile,
  getResourcePermit,
  getSchoolResourcePermit,
  getUserRecordAddPermit,
  getUserRecordUpdatePermit,
  getResourceItemPermit,
  titleTipUpdate,
  resetFile,
  addComment,
  getComment,
  getNewsList,
  getNews,
  editNews,
  adapterBatchAdd,
  healthCheck
};
