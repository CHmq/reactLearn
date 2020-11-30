import { client } from "components/services/apiService";


const url = `${process.env.REACT_APP_API_URL_RESOURCE}/user_log`;
const certUrl = `${process.env.REACT_APP_API_URL_RESOURCE}/user_cert`;
const resourceUrl = `${process.env.REACT_APP_API_URL_RESOURCE}/resource_log`;

//觀看記錄頁面
export async function history(offset=0, limit=10) {
  return await client.post({
    url: `${url}/get_list`,
    form: {
      offset,
      limit
    }
  })
}

export async function daily(type) {
  return await client.post({
    url: `${url}/get_daily`,
    form: {
      type
    }
  })
}

export async function weekly() {
  return await client.post({
    url: `${url}/get_weekly`,
    form: {}
  })
}

export async function chart(course_id, chart_type) {
  return await client.post({
    url: `${url}/get_chart`,
    form: {
      course_id,
      chart_type
    }
  })
}

export async function getStudentReport(class_id=null, course_id=null) {
  return await client.post({
    url: `${url}/get_student_report`,
    form: {
      class_id,
      course_id
    }
  })
}

export async function getUserReport(class_id=null, res_id=null, course_id) {
  return await client.post({
    url: `${resourceUrl}/get_user_report`,
    form: {
      class_id,
      res_id,
      course_id
    }
  })
}
// 學生證書
export async function genCertJob() {
  return await client.post({
    url: `${certUrl}/gen_cert_job`,
    form: {
      type: 'COURSE'
    }
  })
}

// 家長獲取證書
export async function genCeoCertJob() {
  return await client.post({  
    url: `${certUrl}/gen_ceo_cert_job`,
    form: {}
  })
}

// 學生證書檢查
export async function getByUser() {
  return await client.post({
    url: `${certUrl}/get_by_user`
  })
}

// 家長獲取證書檢查
export async function getListByUser() {
  return await client.post({
    url: `${certUrl}/get_list_by_user`
  })
}

export default {
  history,
  daily,
  weekly,
  chart,
  getStudentReport,
  getUserReport,
  genCertJob,
  genCeoCertJob,
  getByUser,
  getListByUser
};