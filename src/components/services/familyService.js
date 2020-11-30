import { client } from "./apiService";


const url = `${process.env.REACT_APP_API_URL_USER}/family`;

/** 新增子女接口
 * params
 *  sex 性别
 *
 *  language 家长的语言
 *
 *  family_id 當前家庭的 id
 *
 *  first_name 名 *可不填
 *
 *  last_name 姓 *可不填
 *
 * return
 *  user_id 新增子女的 user_id
 *  */
export async function addChildren({
  sex,
  language,
  family_id,
  first_name,
  kid_token,
  // last_name,
  email,
  tel,
  grade_type,
  role,
  region
}) {
  const AddChildren_API = new Map()
    .set(
      email,
      async () =>
        await client.post({
          url: `${url}/add_member`,
          form: {
            relation: role,
            email,
            family_id,
            language,
            region
          }
        })
    )
    .set(
      tel,
      async () =>
        await client.post({
          url: `${url}/add_member`,
          form: {
            relation: role,
            tel,
            family_id,
            language
          }
        })
    )
    .set(
      kid_token,
      async () =>
        await client.post({
          url: `${url}/add_member`,
          form: {
            relation: "CHILD",
            kid_token,
            family_id,
            language,
            sex
          }
        })
    );

  return email || tel || kid_token
    ? AddChildren_API.get(email || tel || kid_token)()
    : await client.post({
        url: `${url}/add_member`,
        form: {
          relation: "CHILD",
          family_id,
          language,
          first_name,
          // last_name,
          sex,
          grade_type
        }
      });
  // return !!first_name && !!last_name
  //   ? await client.post({
  //       url: `${url}/add_member`,
  //       form: {
  //         relation: "CHILD",
  //         family_id,
  //         language,
  //         first_name,
  //         last_name,
  //         sex
  //       }
  //     })
  //   : await client.post({
  //       url: `${url}/add_member`,
  //       form: {
  //         relation: "CHILD",
  //         family_id,
  //         kid_token,
  //         language,
  //         sex
  //       }
  //     });
}

// 選擇子女接口
export async function bindChlidren({ kid_token, user_id }) {
  return await client.post({
    url: `${url}/bind`,
    form: {
      kid_token,
      user_id
    }
  });
}

export async function accept(family_id) {
  return client.post({
    url: `${url}/accept`,
    form: {
      family_id
    }
  });
}

export default {
  addChildren,
  bindChlidren,
  accept
};
