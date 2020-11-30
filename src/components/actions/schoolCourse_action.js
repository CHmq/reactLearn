import course from "components/services/courseService";
import courseItem from "components/services/courseItemService";
import favourite from "components/services/user_favourite";
import school from "components/services/school";
import staff from "components/services/staffService";

export function getInfo(info) {
  return { type: 'GET_INFO', payload: info }
}

export function getList(list) {
  return { type: 'GET_LIST', payload: list }
}

// export function setLike(list) {
//   return { type: 'SET_LIKE' }
// }

export function getClass(info) {
  return { type: 'GET_CLASS', payload: info }
}

export function getStaffPermit(info) {
  return { type: 'GET_STAFF_PERMIT', payload: info }
}

// export function resetFile() {
//   return { type: 'RESET_FILE' }
// }

// export function deleteCourse() {
//   return { type: 'DELETE_COURSE' }
// }

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

export function getClassAction(currentLocation, grade)  {
  return (dispatch) => {
    school.getClassTree(currentLocation).then(ret => {
      dispatch(getClass({
        classTree: ret.classTree,
        classList: !!grade ? ret.classList.filter((item) =>
          grade.includes(item.grade_type) 
        ) : ret.classList
      }));
    }).catch(() => {
      dispatch(getClass(defaultState.class));
    });
  }
};

export function getInfoAction(id, callback) {
  return (dispatch) => {
    course.get(id).catch(_err => {
      dispatch(getInfo(defaultState.info));
      return null;
    }).then(ret => {
      if(!!ret) {
        dispatch(getInfo(ret));
        dispatch(
          getStaffPermit(staff.getResourcePermit(ret.school_id))
        )
      }
    }).finally(() => {
      if(callback) callback();
    })
  }
}

export function getListAction({ id, grade=[], sort, order, is_cache, callback }) {
  return (dispatch) => {
    courseItem.get_list(id, grade, 0, 9999, sort, order, is_cache).catch(_err => {
      dispatch(getList(defaultState.list));
    }).then(ret => {
      dispatch(getList(ret));
    }).finally(() => {
      if(callback) callback();
    })
  }
}

export function setLikeAction({id, type, callback}) {
  return (dispatch) => {
    favourite[type](id).then(ret => {
      if(callback) callback();
    })
  }
}

export function resetFileAction({id, type, callback}) {
  return (dispatch) => {
     return course.resetFile(id, type)
      .catch(_err => {
        return null;
      })
      .then(ret => {
        if(callback) callback();
        return true;
      });
  }
}

export function deleteCourseAction({id, callback}) {
  return (dispatch) => {
    return courseItem.remove(id)
      .catch(_err => {
        return null;
      })
      .then(ret => {
        if(callback) callback();
        return true;
      });
  }
}

