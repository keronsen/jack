
(function (){ // START HIDING FROM GLOBAL SCOPE
	/** EXPORT JACK **/
	window.jack = new Jack();
	return;
	
	
	/**
	 * Constructor for object that will be exposed as the global jack
	 */
	function Jack() {
		var grabs = {};
		var environment = new Environment();
		var reportMessage = "Expectation failed: {name}() was expected {expected} time(s), but was called {actual} time(s).";
		init();
		return createPublicApi();
		
		function init() {
			
		}
		function createPublicApi() {
			var api = jackFunction;
			api.grab = grab;
			api.examine = examine;
			api.expect = expect;
			api.report = report;
			api.env = environment;
			return api;
		}
		function jackFunction(func) {
			grabs = {};
			func();
			reportToEnvironment();
			resetGrabs();
		}
		function reportToEnvironment() {
			for(var name in grabs) {
				if(grabs[name].report) {
					var report = grabs[name].report();
					if(report.fail) {
						environment.report(generateReportMessage(name,report));
					}
				}
			}
		}
		function generateReportMessage(grabName,report) {
			return reportMessage
					.replace("{name}",grabName)
					.replace("{expected}",report.expected)
					.replace("{actual}",report.actual);
		}
		function grab(name) {
			var grabbed = null;
			eval("grabbed = " + name);
			if("function" == typeof grabbed) {
				return grabFunction(name, grabbed);
			} else if("object" == typeof grabbed) {
				return grabObject(name, grabbed);
			}
			return null;
		}
		function grabFunction(fullName, grabbed) {
			var functionName = fullName;
			var parentObject = window;
			var nameParts = fullName.split(".");
			if(nameParts.length > 1) {
				functionName = nameParts.pop();
				var parentName = nameParts.join(".");
				eval("parentObject = " + parentName);
			}
			grabs[fullName] = new FunctionGrab(functionName, grabbed, parentObject);
			return grabs[fullName];
		}
		function grabObject(name, grabbed) {
			grabs[name] = new ObjectGrab(name, grabbed);
			return grabs[name];
		}
		
		function examine(name) {
			return findGrab(name);
		}
		function expect(name) {
			return findGrab(name).expect().once();
		}
		function report(name) {
			return findGrab(name).report();
		}
		function findGrab(name) {
			var parts = name.split(".");
			if(parts.length == 1) {
				return grabs[name];
			} else {
				if(grabs[name] != undefined) {
					return grabs[name];
				}
				var grab = grabs[parts[0]];
				if(grab == undefined) {
					return undefined;
				} else {
					return grab.examine(parts[1]);
				}
			}
		}
		function resetGrabs() {
			for(var g in grabs) {
				grabs[g].reset();
			}
		}
	} // END Jack()
	
	
	/**
	 * @functionName      Name of grabbed function
	 * @grabbedFunction   Reference to grabbed function
	 * @parentObject      The object the function was grabbed from
	 */
	function FunctionGrab(functionName, grabbedFunction, parentObject) {
		var invocations = [];
		var expectations = [];
		var mockImplementation = null;
		init();
		return {
			'times': function() { return invocations.length; },
			'reset': reset,
			'expect': expect,
			'report': report,
			'mock': mock
		};
		
		function init() {
			parentObject[functionName] = handleInvocation;
		}
		function handleInvocation() {
			invocations.push("");
			if(mockImplementation == null) {
				grabbedFunction.apply(this,arguments);
			} else {
				mockImplementation.apply(this,arguments);	
			}
		}
		function reset() {
			parentObject[functionName] = grabbedFunction;
		}
		function mock(implementation) {
			mockImplementation = implementation;
		}
		function expect() {
			var ex = {};
			ex.times = 0;
			ex.mock = mock;
			ex.once = function() {
				ex.times = 1;
				return ex;
			}
			expectations.push(ex);
			return ex;
		}
		function report() {
			var report = { expected:0, actual: 0, success:true, fail:false };
			report.actual = invocations.length;
			if(expectations.length>0) {
				report.expected = expectations[0].times;
			}
			if(report.actual != report.expected) {
				report.fail = true;
				report.success = false;
			}
			return report;
		}
	} // END FunctionGrab()
	
	
	/**
	 *
	 */
	function ObjectGrab(objectName, grabbedObject) {
		var grabs = {};
		
		init();
		return {
			'examine': examine,
			'reset': reset
		};
		
		function init() {
			for(key in grabbedObject) {
				var property =  grabbedObject[key];
				if("function" == typeof property) {
					grabs[key] = new FunctionGrab(key, property, grabbedObject);
				}
			}
		}
		function examine(name) {
			return grabs[name];
		}
		function reset() {
			for(var g in grabs) {
				grabs[g].reset();
			}
		}
	}
	
	
	/**
	 *
	 */
	function Environment() {
		var reportingEnabled = true;
		init();
		return {
			'isJSSpec': isJSSpec,
			'report': report,
			'disableReporting': function() { reportingEnabled = false; }
		}
		function init() {
			
		}
		function isJSSpec() {
			return window.JSSpec != null;
		}
		function report(message) {
			if(!reportingEnabled) { return; }
			if(isJSSpec()) {
				value_of("").should_fail(message);
			}
		}
	}
})(); // END HIDING FROM GLOBAL SCOPE












































