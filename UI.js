var UI = (function(){

	var UIobjects = {};

	function init(){
		addObject("quad" ,function(){console.log("hi");});
		console.log(UIobjects);
	}

	function addObject(UIname, UIcallback){
		UIobjects[UIname] = UIcallback;
	}

	function buttonCallback(name){

		if (UIobjects.name !== undefined) {
			UIobjects.name();
		};
	}

	return {
		init:init,
		setSetting:buttonCallback
	}

})()