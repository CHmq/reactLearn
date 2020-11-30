import React, { Component } from "react";
import { connect } from "react-redux";

import courseItem from "components/services/courseItemService";
import course from "components/services/courseService";
import staff from "components/services/staffService";
import NProgress from "nprogress";

/**
 *
 * @export Course Tepmlate interface
 * @class CourseTemplate
 * @extends {Component}
 */
class CourseTemplate extends Component {
  $$isMount = false;

  state = {
    course: {
      id: null,
      school_id: null,
    },
    sectionList: [],
    selectList: [],
    sort: null,
    order: null,
    rest: {
      style: null,
    },
    staffPermit: {
      add: false,
      delete: false,
      get: false,
      get_list: false,
      update: false,
    },

    $$loading: false,
    $$updateLoading: false,

    offset: 0,
    limit: 20,
    total: 0,

    result: [],
  };

  componentDidMount = async () => {
    console.log(this.props);
    this.$$isMount = true;
    if (!this.$$isMount) {
      return;
    }

    const {
      route,
      user,
      dispatch,
      children,
      courseID,
      staffPermitCallback,
      userPermitCallback,
      getInfo,
      getList,
      getSectionList,
      ...rest
    } = this.props;

    this._staffPermitCallback =
      staffPermitCallback || this._staffPermitCallback;
    this._userPermitCallback = userPermitCallback || this._userPermitCallback;
    this._getCallback = getInfo || this._getCallback;
    this._getListCallback = getList || this._getListCallback;
    this._getSectionListCallback =
      getSectionList || this._getSectionListCallback;

    if (!!this.$$isMount) {
      this._getStaffPermit();
      this._getUserPermit();
    }

    if (!!this.$$isMount) {
      this.setState({ rest });
    }
  };

  componentDidUpdate = async (prevProps, prevState) => {
    if (prevProps.courseID !== this.props.courseID) {
      this._getCallback({});
      this._getSectionListCallback([]);
      this._getListCallback({ total: 0, rows: [] });
      this.setState(
        {
          course: {
            id: null,
            school_id: null,
          },
          offset: 0,
          sectionList: [],
          selectList: [],
          sort: null,
          order: null,
        },
        () => {
          this._getUserPermit();
        }
      );
    }
    if (prevProps.changed !== this.props.changed) {
      this.setState({ offset: 0, limit: 20 });
    }
  };

  componentWillUnmount = async () => {
    this.$$isMount = false;
  };

  isLoading = () => {
    return !!this.state.$$loading && this.state.result.length === 0;
  };

  updateLoading = () => {
    return !!this.state.$$updateLoading;
  };

  isMore = () => {
    return (this.state.offset + 1) * this.state.limit < this.state.total;
  };

  _getStaffPermit = () => {
    let _permit = !this.state.course.school_id
      ? this.state.staffPermit
      : staff.getResourcePermit(this.state.course.school_id);
    if (_permit !== this.state.staffPermit && !!this.$$isMount) {
      this.setState({ staffPermit: _permit }, () => {
        typeof this._staffPermitCallback === "function" &&
          this._staffPermitCallback(this.state.staffPermit);
      });
    }
  };

  _getUserPermit = () => {
    let _permit = true;
    this.setState({ userPermit: { get_list: _permit } }, () => {
      if (this.state.userPermit.get_list) {
        this.getData();
      }
      typeof this._userPermitCallback === "function" &&
        this._userPermitCallback(this.state.userPermit);
    });
  };

  _getCallback = (info = {}) => {
    console.log(info);
  };
  _getListCallback = (list = { total: 0, rows: [] }) => {
    console.log(list);
  };
  _getSectionListCallback = (sectionList = []) => {
    console.log(sectionList);
  };
  _staffPermitCallback = (permit) => {
    console.log(permit);
  };
  _userPermitCallback = (permit) => {
    console.log(permit);
  };

  getSectionList = () => {
    return this.state.sectionList;
  };

  setList = (ret, i_set = true) => {
    let $$list = Object.values(
      ret.reduce((_list, { section_id, section_name, ...rest }) => {
        if (!_list[section_id])
          _list[section_id] = {
            section_id,
            section_name,
            data: [],
          };
        _list[section_id]["data"].push({ section_id, section_name, ...rest });
        return _list;
      }, {})
    );
    if (!!i_set && !!this.$$isMount) {
      this.setState({ sectionList: $$list }, () => {
        this._getSectionListCallback(this.state.sectionList);
      });
    }
    return $$list;
  };

  getCourse = async () => {
    return this.get(false, () => {}, false);
  };

  get = async (i_reset = true, _callback = () => {}, i_itemList = true) => {
    let _call = course
      .get(this.props.courseID)
      .catch((_err) => {
        console.log(_err);
        if (typeof window !== "undefined") {
          window.location.href = this.props.route.locationUrl;
        }
        return null;
      })
      .then((ret) => {
        if (!!this.$$isMount && this.state.$$loading === _call) {
          this.setState(
            {
              offset: 0,
              course: ret,
              $$loading: false,
            },
            () => {
              this._getStaffPermit();
              if (!!ret) {
                _callback(ret);
                if (!!i_itemList) {
                  this.getList(i_reset);
                }
                this._getCallback(ret);
              }
            }
          );
        }
      });
    if (!!this.$$isMount) {
      this.setState({
        $$loading: _call,
      });
    }
    return _call;
  };

  getFullInfo = async (ref_id = null) => {
    return course.getFullInfo(ref_id);
  };

  removeCourse = async (i_cItemID = null) => {
    console.log(i_cItemID);
    // const test = this.state.sectionList[0].data.filter(
    //   item => item.id !== i_cItemID
    // );

    // const test = this.state.sectionList.map(section => ({
    //   //   ...section,
    //   data: section.data.filter(section => section.id !== i_cItemID)
    // }));

    // console.log(test);

    return courseItem.remove(i_cItemID).then((ret) => {
      if (!!ret) {
        const section = this.state.sectionList.map((section) => ({
          //   ...section,
          data: section.data.filter((section) => section.id !== i_cItemID),
        }));

        this.setState({ sectionList: section }, () => {
          this._getSectionListCallback(this.state.sectionList);
        });

        // let _section = this.state.sectionList;
        // this.setState({sectionList : _section.map(section => {
        //     return { ...section , data : section.data.map(item => {
        //         return (item.id.toString() === i_cItemID.toString()) ? null : item;
        //     }) }
        // })} , () => {
        //     this._getSectionListCallback(this.state.sectionList);
        // });
      }
      return ret;
    });
  };

  updateList = async (_offset = 0, i_force = true) => {
    this.setState({ offset: _offset, $$updateLoading: true }, () => {
      this.getList(i_force);
    });
  };

  getList = async (i_reset = true) => {
    const { courseID } = this.props;
    let course_id =
      courseID === "school_resource" ? "school_resource" : this.state.course.id;
    NProgress.set(0.4);
    if (!!course_id) {
      let _call = courseItem
        .get_list(
          course_id,
          this.state.selectList,
          this.state.offset * this.state.limit,
          20,
          this.state.sort,
          this.state.order
        )
        .catch((_err) => {
          console.log(_err);
          return { total: 0, rows: [] };
        })
        .then(({ total, rows }) => {
          let _ret = (!i_reset ? this.state.result : []).concat(rows);
          if (!!this.$$isMount && this.state.$$loading === _call) {
            this.setState(
              {
                total: total,
                result: _ret,
                $$loading: false,
                $$updateLoading: false,
              },
              () => {
                this.setList(this.state.result);
                this._getListCallback({ total, rows });
                NProgress.done();
              }
            );
          }
          return _ret;
        });
      if (!!this.$$isMount) {
        this.setState({
          $$loading: _call,
        });
      }
      // NProgress.done();
      return _call;
    }
  };

  getData = async (i_reset = true) => {
    if (!!i_reset && !!this.$$isMount) {
      this.setState({ offset: 0, result: [], sectionList: [] }, () => {
        this.getData(false);
      });
      return;
    }
    return this.get(i_reset);
  };

  setOffset = (_offset, i_refresh = true, i_force = false) => {
    this.setState({ offset: _offset }, () => {
      if (!!i_refresh) {
        this.getList(i_force);
      }
    });
  };

  setFilter = (i_select = []) => {
    NProgress.start();
    this.setState({ selectList: i_select }, () => {
      this.setOffset(0, true, true);
    });
  };

  setSort = (i_sort, i_order) => {
    this.setState({ sort: i_sort, order: i_order }, () => {
      this.setOffset(0, true, true);
    });
  };

  render() {
    const rest = !!this.$$isMount ? { ...this.state.rest } : {};
    return <div {...rest}>{this.props.children}</div>;
  }
}

function mapStateToProps({ route, user, translations }) {
  return { route, user, translations };
}

export default connect(mapStateToProps, null, null, { forwardRef: true })(
  CourseTemplate
);
