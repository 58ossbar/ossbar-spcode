
/**
 * 网络状态
 */
const networkType = {
  WIFI : "wifi",
  NONE : "none",
  G2 : "2g",
  G3 : "3g",
  G4: "4g",
  G5 : "5g",
}
/**
 * 系统模式
 */
const appState = {
  PROD : "prod",
  DEV : "dev",
  TEST : "test"
}

module.exports = {
  networkType: networkType,
  appState: appState
}