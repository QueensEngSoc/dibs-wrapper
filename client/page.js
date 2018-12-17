// function createAppScript(container, options) {
//   return new Promise(function appendAppScript(resolve, reject) {
//     if (!options.appBundleSrc) {
//       return;
//     }
//     var script = document.createElement('script');
//     script.type = 'text/javascript';
//     script.onload = resolve;
//     script.onerror = reject;
//     script.src = options.appBundleSrc;
//     container.appendChild(script);
//   });
// }
//
// window.page = function page(container, options) {
//   window.ESSDEV.store = options.store;
//   return createAppScript(container, options);
// };
