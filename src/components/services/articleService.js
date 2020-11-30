import { client } from "./apiService";

const url = `${process.env.REACT_APP_API_URL_ARTICLE}`;
const url_parentsdaily = `${process.env.REACT_APP_API_URL_PD}/api/article`;

export async function getLatest(lang) {
  return await client.post({
    url: `${url_parentsdaily}/get_latest`,
    form: {
      lang: lang,
      limit: 10,
      offset: 0,
      order: 'DESC',
      sort: 'publish_time'
    }
  });
}

export async function userRecord() {
  return await client.post({
    url: `${url}/user_record/get`,
    form: {}
  });
}

export async function uploadFile(_permit, file) {
  return client.uploadOSS(_permit, file);
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
    type: i_fileMeta.type
  };
  const formData = Object.assign({}, { meta: meta }, i_formData);
  return client.post({
    url: `${url}/upload/token/${i_controller}/${i_action}`,
    form: formData
  });
}

export default {
  getLatest,
  uploadFile,
  userRecord,
  getUserRecordAddPermit,
  getUserRecordUpdatePermit
};