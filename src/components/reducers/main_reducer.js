const defaultState = {
  full_info: { item: [] },
};

export const main = (state = defaultState, { type, payload }) => {
  switch (type) {
    case "GET_FULL_DISPLAY_INFO":
      return { ...state, full_info: payload };
    case "error":
      return { ...state, error: payload };
    default:
      return defaultState;
  }
};
