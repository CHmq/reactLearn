export const translations = (state = false, action) => {
  switch (action.type) {
    case "initTranslations":
      return { ...state, initDone: action.payload };
    case "updateTranslations":
      return { ...state, initDone: action.payload };
    case "updateFileName":
      return { ...state, fileName: action.payload };
    default:
      return state;
  }
};
