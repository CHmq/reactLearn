import mainService from "components/services/mainService";

export function getFullDisplayInfo(info) {
  return { type: "GET_FULL_DISPLAY_INFO", payload: info };
}

export function setError(info) {
  return { type: "error", payload: info };
}

export function getFullDisplayInfoAction(id) {
  return async (dispatch) => {
    try {
      const result = await mainService.getFullDisplayInfo(id);
      dispatch(getFullDisplayInfo(result));
    } catch (error) {
      dispatch(setError(error));
    }
  };
}
