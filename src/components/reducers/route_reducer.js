export const route = (state = {}, action) => {
  switch (action.type) {
    case "initRoute":
      return { ...state, ...action.payload };
    case "updateRoute":
      return { ...state, ...action.payload };
    default:
      return state;
  }
};
