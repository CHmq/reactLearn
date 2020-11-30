export const merchant = (state = {}, action) => {
  switch (action.type) {
    case "setMerchant":
      return { ...state, ...action.payload };
    default:
      return state;
  }
};
