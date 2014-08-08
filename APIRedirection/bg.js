var toggle=true;

function showPageAction(tabId, msg){
	chrome.pageAction.show(tabId);
	chrome.pageAction.setTitle({
		tabId:tabId,
		title:msg
	});
	if(!toggle){
		chrome.pageAction.setIcon({
			tabId:tabId,
			path:"grey19.png"
		});
	}
}

var jQueryVersion=/[0-9]\.[0-9]{1,2}\.[0-9]/;
var censorURLs=[
  "*://*.googleapis.com/*",
  "*://*.google.com/*",
  "*://*.twitter.com/*",
  "*://*.facebook.net/*",
  "*://*.youtube.com/*"
];

chrome.webRequest.onBeforeRequest.addListener(function(details){
	if(!toggle){
		showPageAction(details.tabId, "API Redirection Off");
		return;
	}
  var u=details.url;
  if(u.indexOf("jquery")){
    var extracted=jQueryVersion.exec(u);
    if(extracted&&extracted.length==1){
			showPageAction(details.tabId, "jQuery redirected");
      var mirror="http://code.jquery.com/jquery-"+extracted[0]+".js";
      console.log("[INFO] "+u + " redirected to "+ mirror);
      return {redirectUrl:mirror};
    }
  }
	showPageAction(details.tabId, "API Request Cancelled");
  console.log("[WARNING] "+u + " not loaded");
  return {redirectUrl:"data:text/javascript,console.log('"+u+" is not loaded');"};
}, {
  urls:censorURLs,
	types:[
		"script"
	]
}, ['blocking']);

chrome.webRequest.onBeforeRequest.addListener(function(details){
	if(!toggle){
		showPageAction(details.tabId, "API Redirection Off");
		return;
	}
  var u=details.url;
	showPageAction(details.tabId, "Web Request Cancelled");
  console.log("[WARNING] "+u + " not loaded");
  return {redirectUrl:"data:text/plain,"+details.url+" is not loaded"};
}, {
  urls:censorURLs,
	types:[
		"main_frame", "sub_frame", "stylesheet", "image", "object", "xmlhttprequest", "other"
	]
}, ['blocking']);

chrome.pageAction.onClicked.addListener(function(details){
	toggle=!toggle;
	chrome.tabs.reload(details.tabId, {bypassCache: true});
});
