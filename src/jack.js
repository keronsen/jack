/**
 *
 *  JACK :: JavaScript Mocking.
 *  Version: $Id$
 *
 */



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
		var reportMessages = [];
		init();
		return createPublicApi();
		
		function init() {
			
		}
		function createPublicApi() {
			var api = jackFunction;
			api.grab = grab;
			api.inspect = inspect;
			api.expect = expect;
			api.report = report;
			api.env = environment;
			return api;
		}
		function jackFunction(func) {
			before();
			func();
			after();
		}
		function before() {
			grabs = {};
			environment.reset();
		}
		function after() {
			var reports = getTextReports();
			resetGrabs();
			if(reports.length > 0) {
				environment.report(reports[0]);
			}
		}
		function getTextReports() {
			var reports = [];
			for(var name in grabs) {
				if(grabs[name].report) {
					var report = grabs[name].report();
					if(report.fail) {
						reports.push(generateReportMessage(name,report));
					}
				}
			}
			return reports;
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
		
		function inspect(name) {
			return findGrab(name);
		}
		function expect(name) {
			if(grabs[name]==null) {
				grab(name);
			}
			return findGrab(name).expect().once();
		}
		function report(name, expectation) {
			return findGrab(name).report(expectation);
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
		var mockImplementation;
		var savedArguments;
		
		init();
		return {
			'times': function() { return invocations.length; },
			'reset': reset,
			'expect': expect,
			'report': report,
			'mock': mock,
			'arguments': getArguments
		};
		
		function init() {
			parentObject[functionName] = handleInvocation;
		}
		function handleInvocation() {
			var invocation = {
				'arguments': arguments,
				'matchingExpectation': null
			};
			invocations.push(invocation);
			var expectation = findMatchingExpectation(invocation);
			if(expectation != null) {
				expectation._matchingInvocations.push(invocation);
				invocation.matchingExpectation = expectation;
			}			
			if(expectation && expectation._saveArguments) {
				savedArguments = arguments;
				for(var i=0; i<expectation._saveArgumentNames.length; i++) {
					var name = expectation._saveArgumentNames[i];
					savedArguments[name] = savedArguments[i];
				}
			}
			if(mockImplementation == null) {
				grabbedFunction.apply(this,arguments);
			} else {
				return mockImplementation.apply(this,arguments);	
			}
		}
		function findMatchingExpectation(invocation) {
			for(var i=0; i<expectations.length; i++) {
				var expectation = expectations[i];
				if(isArgumentContstraintsMatching(invocation, expectation)) {
					return expectation;
				}
			}
			return null;
		}
		function isArgumentContstraintsMatching(invocation, expectation) {
			var constr = expectation._argumentConstraints;
			var arg = invocation.arguments;
			if(constr == null) {
				return true;
			} else if(constr.length != arg.length) {
				return false;
			} else {
				for(var i=0; i<constr.length; i++) {
					if(constr[i] != arg[i]) {
						return false;
					}
				}
				return true;
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
			ex._id = expectations.length;
			ex._times = 0;
			ex._timesModifier = 0;
			ex._saveArguments = false;
			ex._saveArgumentNames = [];
			ex._argumentConstraints = null;
			ex._argumentConstraintsMet = true;
			ex._matchingInvocations = [];
			ex.mock = mock;
			ex.atLeast = function(n) { ex._times = parseTimes(n); ex._timesModifier = 1; return ex; }
			ex.atMost  = function(n) { ex._times = parseTimes(n); ex._timesModifier = -1; return ex; }
			ex.exactly = function(n) { ex._times = parseTimes(n); return ex; }
			ex.once = function() { return ex.exactly(1) }
			ex.saveArguments = function() { 
				ex._saveArguments = true; 
				ex._saveArgumentNames = arguments;
				return ex;
			}
			ex.withArguments = function() { 
				ex._saveArguments = true;
				ex._argumentConstraints = arguments;
				return ex;
			}
			ex.withNoArguments = function() { ex.withArguments(); }
			expectations.push(ex);
			return ex;
		}
		function parseTimes(expression) {
			var result = 0;
			if("number" == typeof expression) {
				result = expression;
			} else if("string" == typeof expression) {
				var parts = expression.split(" ");
				result = parseInt(parts[0]);
			}
			return result;
		}
		function report(expectation) {
			if(expectation == null) {
				expectation = expectations[0];
			}
			var report = { expected:0, actual: 0, success:true, fail:false };
			if(expectation == null) {
				report.actual = invocations.length;
				if(report.actual != report.expected) {
					report.fail = true;
					report.success = false;
				}
			} else {
				report.actual = expectation._matchingInvocations.length;
				report.expected = expectation._times;
				if(expectation._timesModifier == 0 && report.actual != report.expected) {
					report.fail = true;
					report.success = false;
				}
				if(expectation._timesModifier > 0 && report.actual < report.expected) {
					report.fail = true;
					report.success = false;
				}
				if(expectation._timesModifier < 0 && report.actual > report.expected) {
					report.fail = true;
					report.success = false;
				}
			}
			return report;
		}
		function getArguments() {
			return savedArguments;
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
		var reports = {};
		init();
		return {
			'isJSSpec': isJSSpec,
			'report': report,
			'disableReporting': function() { reportingEnabled = false; },
			'enableReporting': function() { reportingEnabled = true; },
			'reset': function() { reports = [] }
		}
		function init() {
			
		}
		function isJSSpec() {
			return window.JSSpec != null;
		}
		function report(message) {
			if(!reportingEnabled) { return; }
			if(isJSSpec() && !reports[message]) {
				JSSpec._assertionFailure = {'message':message};
				if(JSSpec.Browser.Trident) {
					var exec = window._curExecutor;
					exec.onException(exec,JSSpec._assertionFailure);
				} else {
					reports[message] = true;
					throw JSSpec._assertionFailure;
				}
			}
		}
	}
})(); // END HIDING FROM GLOBAL SCOPE












































