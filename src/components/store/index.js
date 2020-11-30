import { createStore, compose, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { persistStore, persistReducer } from "redux-persist";
//import storageSession from 'redux-persist/lib/storage/session'
import storage from 'redux-persist/lib/storage'
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";

import { rootReducer } from "components/reducers";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// redux-persist 配置信息
const persistConfig = {
  // localStorage 中的名称
  key: "root",
  // 数据
  storage: storage,
  stateReconciler: autoMergeLevel2, // 查看 'Merge Process' 部分的具体情况
  // 白名单
  whitelist: ["route" , "user" , "merchant"]
};

// 传递给createStore函数 这个export
export const store = createStore(
  // 包装 rootReducer
  persistReducer(persistConfig, rootReducer),
  composeEnhancers(applyMiddleware(thunk))
);

// 最后导出二者
export const persistor = persistStore(store);
