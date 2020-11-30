export const user = (state = {}, action) => {
  switch (action.type) {
    case "INIT":
      return { ...action.payload };
    case "UpdateAvatar":
      return { ...state, img: action.payload };
    default:
      return state;
  }
};
