const defaultState = {
  info: {},
  list: { total: 0, rows: [] },
  class: {
    classTree: [],
    classList: []
  },
  staffPermit: {
    add: false,
    delete: false,
    get: false,
    get_list: false,
    update: false,
  }
}

export const schoolCourse = (state = defaultState, { type, payload }) => {
  switch (type) {
    case "GET_INFO":
      return { ...state, info: payload };
    case "GET_LIST":
      return { ...state, list: payload };
    case "GET_CLASS":
      return { ...state, class: payload };
    case "GET_STAFF_PERMIT": 
      return { ...state, staffPermit: payload }
    default:
      return state;
  }
};
