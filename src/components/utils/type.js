export function fileTypeOf(file, typeArr) {
   return typeof(file) === 'string' ? typeArr.some(item => !!file.toLowerCase().endsWith(item)) : false;
}

export function isMobile() {
   let mobile = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
   return mobile!= null;
 }