import { client } from "./apiService";

const url = `${process.env.REACT_APP_API_URL_RESOURCE}/school`;

export async function addItem(res_id) {
  return await client.post({
    url: `${process.env.REACT_APP_API_URL_RESOURCE}/school_resource/add_item`,
    form: {
      res_id,
    },
  });
}

export async function deleteItem(id) {
  return await client.post({
    url: `${process.env.REACT_APP_API_URL_RESOURCE}/school_resource/delete_item`,
    form: {
      id,
    },
  });
}

export async function setCover(item_id) {
  return await client.post({
    url: `${process.env.REACT_APP_API_URL_RESOURCE}/school_resource/set_cover`,
    form: {
      item_id,
    },
  });
}

export async function getTagCount() {
  return await client.post({
    url: `${process.env.REACT_APP_API_URL_RESOURCE}/school_resource/get_tag_count`,
    form: {},
  });
}

//获取数据列表
export async function getClassList() {
  return await client.post({
    url: `${url}/get_class_list`,
  });
}

function gradeChange(region, grade) {
  if (region === "my") {
    switch (grade) {
      case "PN":
        return "N1";
      case "K1":
        return "N2";
      case "K2":
        return "K1";
      case "K3":
        return "K2";
      default:
        return grade;
    }
  }
  return grade;
}

export async function getClassTree(region) {
  return this.getClassList()
    .then((ret) => ret.rows)
    .catch((err) => [])
    .then((gList) => {
      let _ret = gList.reduce(
        (
          _list,
          { grade_id, year_name, grade_name, class_name, grade_type, class_id }
        ) => {
          const gradeType = gradeChange(region, grade_type);

          if (!_list[grade_type]) {
            _list[grade_type] = {
              title: `${gradeType}`,
              value: `${grade_type}`,
              key: `${grade_type}`,
              children: [],
            };
          }
          if (!_list[grade_type]["children"][grade_id]) {
            _list[grade_type]["children"][grade_id] = {
              title: `${year_name} ${grade_name}`,
              value: `${grade_type}-${grade_id}`,
              key: `${grade_type}-${grade_id}`,
              children: [],
            };
          }
          _list[grade_type]["children"][grade_id]["children"].push({
            title: `${class_name}`,
            value: `${grade_type}-${grade_id}-${class_id}`,
            key: `${grade_type}-${grade_id}-${class_id}`,
          });
          return _list;
        },
        {}
      );
      (Object.keys(_ret) || []).map((_gType) => {
        _ret[_gType]["children"] = Object.values(_ret[_gType]["children"]);
        return true;
      });
      return { classTree: Object.values(_ret), classList: gList };
    });
}

// 校本资料上传预设封面图
export async function setPreviewImg(id) {
  return await client.post({
    url: `${process.env.REACT_APP_API_URL_RESOURCE}/school_resource/cover`,
    form: {
      id,
    },
  });
}

// home 页面 饼图图表 数据
export async function getStorage() {
  return await client.post({
    url: `${process.env.REACT_APP_API_URL_RESOURCE}/school_resource/get_storage`,
    form: {},
  });
}

export async function getVideoList(offset=0, limit=12, search) {
  return await client.post({
    url: `${process.env.REACT_APP_API_URL_RESOURCE}/school_resource/get_video_list`,
    form: {
      offset: offset * limit,
      limit,
      search
    },
  });
}

export default {
  addItem,
  deleteItem,
  setCover,
  getTagCount,
  getClassList,
  getClassTree,
  getStorage,
  getVideoList
};
