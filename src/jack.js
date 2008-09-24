/**
 *
 *  JACK :: JavaScript Mocking.
 *  Version: $Id$
 *
 */


function jack() {}
(function (){ // START HIDING FROM GLOBAL SCOPE
	/** EXPORT JACK **/
	window.jack = new Jack();
	return;
	
	
	/**
	 * Constructor for object that will be exposed as the global jack
	 */
	function Jack() {
		var functionGrabs = {};
		var objectGrabs = {};
		var environment = new Environment();
		var reportMessages = [];
		var currentExpectation = null;
		var publicApi = createPublicApi();
		return publicApi;
		
		function createPublicApi() {
			var api = jackFunction;
			api.grab = grab;
			api.create = create;
			api.inspect = inspect;
			api.expect = expect;
			api.report = report;
			api.reportAll = reportAll;
			api.env = environment;
			return api;
		}
		function jackFunction() {
			var delegate, testCase;
			switch(arguments.length) {
				case 1:
					delegate = arguments[0];
					break;
				case 2:
					testCase = arguments[0];
					delegate = arguments[1];
					break;
			}
			before();
			firstPass(delegate);
			// secondPass(delegate);
			after(testCase);
		}
		function before() {
			functionGrabs = {};
			objectGrabs = {};
			environment.reset();
		}
		function firstPass(delegate) {
			delegate();
		}
		function secondPass(delegate) {
			var oldExpect = publicApi.expect;
			publicApi.expect = function(name) { 
				var fakeEx = {};
				var grab = findGrab(name);
				if(grab._beenThroughSecondPass) {
					var ex = grab.expect();
					for(prop in ex) {
						if(typeof ex[prop] == "function") {
							fakeEx[prop] = function() { return fakeEx; }
						}
					}
				}
				grab._beenThroughSecondPass = true;
				return fakeEx;
			};
			var findMore = true;
			for(var i=0; findMore && i<10; i++) {
				try {
					delegate();
					findMore = false;
				} catch(exception) {
					var line = -1;
					if(exception.lineNumber != null) {
						line = exception.lineNumber;
					} else if(exception['opera#sourceloc'] != null) {
						line = exception['opera#sourceloc'];
					}
					currentExpectation._lineNumber = line;
				}
			}
			publicApi.expect = oldExpect;
		}
		function after(testCase) {
			var reports = getTextReports();
			resetGrabs();
			if(reports.length > 0) {
				environment.report(reports[0], testCase);
			}
		}
		function getTextReports() {
			var failedReports = [];
			for(var name in functionGrabs) {
				var reports = functionGrabs[name].reportAll(name);
				for(var i=0; i<reports.length; i++) {
					if(reports[i].fail) {
						failedReports.push(reports[i].message);
					}
				}
			}
			for(var name in objectGrabs) {
				var reports = objectGrabs[name].report(name);
				for(var i=0; i<reports.length; i++) {
					if(reports[i].fail) {
						failedReports.push(reports[i].message);
					}
				}
			}
			return failedReports;
		}
		function grab() {
			if("object" == typeof arguments[0] && "string" == typeof arguments[1]) {
				var parentObject = arguments[0];
				var name = arguments[1];
				var fullName = "[local]." + name;
				return grabFunction(fullName, parentObject[name], parentObject);
			} else {
				var grabbed = null;
				eval("grabbed = " + arguments[0]);
				if("function" == typeof grabbed) {
					var functionGrab = grabFunction(arguments[0], grabbed);
					eval("grabbed = " + arguments[0]);
					grabObject(arguments[0], grabbed);
					return functionGrab;
				} else if("object" == typeof grabbed) {
					return grabObject(arguments[0], grabbed);
				}
				return null;
			}
		}
		function grabFunction(fullName, grabbed, parentObject) {
			if(parentObject == null) {
				parentObject = window;
			}
			var functionName = fullName;
			var nameParts = fullName.split(".");
			if(nameParts[0] == "[local]") {
				functionName = nameParts[1];
			} else if(nameParts.length > 1) {
				functionName = nameParts.pop();
				if(parentObject == window) {
					var parentName = nameParts.join(".");
					eval("parentObject = " + parentName);
				}
			}
			functionGrabs[fullName] = new FunctionGrab(functionName, grabbed, parentObject);
			return functionGrabs[fullName];
		}
		function grabObject(name, grabbed) {
			objectGrabs[name] = new ObjectGrab(name, grabbed);
			return objectGrabs[name];
		}
		function create(objectName, functionNames) {
			var mockObject = {};
			for(var i=0; i<functionNames.length; i++) {
				mockObject[functionNames[i]] = function() {};
				var fullName = objectName+"."+functionNames[i];
				grabFunction(fullName, mockObject[functionNames[i]], mockObject);
			}
			return mockObject;
		}
		function inspect(name) {
			return findGrab(name);
		}
		function expect(name) {
			if(findGrab(name) == null) {
				grab(name);
			}
			currentExpectation = findGrab(name).expect().once();
			return currentExpectation;
		}
		function report(name, expectation) {
			return findGrab(name).report(expectation, name);
		}
		function reportAll(name) {
			return findGrab(name).reportAll(name);
		}
		function findGrab(name) {
			var parts = name.split(".");
			if(parts.length == 1 && functionGrabs[name] != null) {
				return functionGrabs[name];
			} else if(parts.length == 1 && objectGrabs[name] != null) {
				return objectGrabs[name];
			} else {
				if(functionGrabs[name] != null) {
					return functionGrabs[name];
				}
				if(objectGrabs[name] != null) {
					return objectGrabs[name];
				}
				if(objectGrabs[parts[0]] != null) {
					return objectGrabs[parts[0]].examine(parts[1]);
				}
				return undefined;
			}
		}
		function resetGrabs() {
			for(var g in functionGrabs) {
				functionGrabs[g].reset();
			}
			for(var g in objectGrabs) {
				objectGrabs[g].reset();
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
		var secondPassExpectations = [];
		var emptyFunction = function(){};
		
		init();
		return {
			'times': function() { return invocations.length; },
			'reset': reset,
			'expect': expect,
			'report': report,
			'reportAll': reportAll,
			'mock': mock,
			'stub': stub,
			'arguments': getArguments,
			'name': function() { return functionName }
		};
		
		function init() {
			var original = parentObject[functionName];
			var handler = function() {
				return handleInvocation.apply(this,arguments);
			}
			for(var prop in original) {
				handler[prop] = original[prop];
			}
			parentObject[functionName] = handler;
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
				for(var i=0; i<expectation._saveArgumentNames.length; i++) {
					var name = expectation._saveArgumentNames[i];
					invocation.arguments[name] = invocation.arguments[i];
				}
			}
			if(expectation == null) {
				return grabbedFunction.apply(this,arguments);
			} else if(expectation._mockImplementation == null) {
				return grabbedFunction.apply(this,arguments);
			} else {
				return expectation._mockImplementation.apply(this,arguments);	
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
					if(!constr[i]) { continue; }
					for(var j=0; j<constr[i].length; j++) {
						if(typeof constr[i][j] == "function" && !constr[i][j](arg[i])) {
							return false;
						}
					}
				}
				return true;
			}
		}
		function reset() {
			parentObject[functionName] = grabbedFunction;
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
			ex._mockImplementation = null;
			ex.mock = function(implementation) { ex._mockImplementation = implementation; return ex; };
			ex.stub = function() { ex._mockImplementation = emptyFunction; return ex; };
			ex.returnValue = function(v) { ex._mockImplementation = function() { return v; } }
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
				if(arguments.length==0) {
					ex._argumentConstraints = [];
				} else {
					for(var i=0; i<arguments.length; i++) {
						ex.whereArgument(i).is(arguments[i]);
					}
				}
				return ex;
			}
			ex.withNoArguments = function() { ex.withArguments(); }
			ex.whereArgument = function(argIndex) {
				ex._saveArguments = true; 
				ex._argumentConstraints = ex._argumentConstraints || [];
				function addConstraint(display, constr) {
					constr.display = display;
					ex._argumentConstraints[argIndex] = ex._argumentConstraints[argIndex] || [];
					ex._argumentConstraints[argIndex].push(constr);
				}
				function createDisplayValue(prefix, value) {
					return typeof value == "string" ? prefix + '"'+value+'"' : prefix+value;
				}
				var argEx = {}
				argEx.is = function(expected) { 
					addConstraint(createDisplayValue('', expected), function(actual) { return actual == expected });
					return ex;
				}
				argEx.isOneOf = function() {
					var expected = arguments;
					var display = [];
					for(var i=0; i<expected.length; i++) {
						display.push(createDisplayValue('', expected[i]));
					}
					addConstraint(
						'oneOf:['+display.join(',')+']', 
						function(actual) {
							for(var i=0; i<expected.length; i++) {
								if(actual == expected[i]) { 
									return true;
								}
							}
							return false;
						});
					return ex;
				}
				argEx.isNot = function(expected) {
					addConstraint(createDisplayValue('not:', expected), function(actual) { return actual != expected });
					return ex;
				}
				argEx.isType = function(expected) {
					addConstraint('', function(actual) { return typeof actual == expected });
					return ex;
				}
				argEx.matches = function(regex) {
					addConstraint('', function(actual) { return actual.match(regex) });
					return ex;
				}
				argEx.hasProperty = function(name, value) {
					var valueIsSpecified = (arguments.length==2);
					addConstraint('', function(actual) { 
						if(valueIsSpecified) {
							return actual[name] == value;
						} else {
							return typeof actual[name] != "undefined";
						}
					});
					return ex;
				}
				argEx.hasProperties = function(keysAndValues) {
					for(key in keysAndValues) {
						argEx.hasProperty(key, keysAndValues[key]);
					}
					return ex;
				}
				return argEx;
			}
			expectations.push(ex);
			return ex;
		}
		function mock(implementation) {
			return expect().mock(implementation);
		}
		function stub() {
			return expect().stub();
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
		function reportAll(fullName) {
			var reports = [];
			for(var i=0; i<expectations.length; i++) {
				reports.push(report(expectations[i], fullName));
			}
			return reports;
		}
		function report(expectation, fullName) {
			if(expectation == null) {
				expectation = expectations[0];
			}
			var report = { expected:0, actual: 0, success:true, fail:false };
			report.message = "";
			report.messageParts = {
				template: "Expectation failed: {name}({arguments}) was expected {quantifier} {expected} time(s), but was called {actual} time(s)",
				quantifier: ""
			};
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
					report.messageParts.quantifier = "exactly";
				}
				if(expectation._timesModifier > 0 && report.actual < report.expected) {
					report.fail = true;
					report.success = false;
					report.messageParts.quantifier = "at least";
				}
				if(expectation._timesModifier < 0 && report.actual > report.expected) {
					report.fail = true;
					report.success = false;
					report.messageParts.quantifier = "at most";
				}
			}
			if(report.fail) {
				report.message = generateReportMessage(report, fullName, getArgumentsDisplay(expectation));
			}
			return report;
		}
		function generateReportMessage(report, fullName, argumentsDisplay) {
			return report.messageParts.template
					.replace("{name}",fullName)
					.replace("{arguments}",argumentsDisplay)
					.replace("{quantifier}",report.messageParts.quantifier)
					.replace("{expected}",report.expected)
					.replace("{actual}",report.actual);
		}
		function getArgumentsDisplay(expectation) {
			if(expectation == null) {
				return "";
			}
			var displayValues = [];
			var constraints = expectation._argumentConstraints;
			if(constraints == null) {
				return "";
			} else {
				for(var i=0; i<constraints.length; i++) {
					if(constraints[i] != null) {
						displayValues.push(constraints[i][0].display);
					} else {
						displayValues.push('[any]');
					}
				}
				return displayValues.join(', ');
			}
		}
		function getArguments() {
			return invocations[0].arguments;
		}
	} // END FunctionGrab()
	
	
	/**
	 *
	 */
	function ObjectGrab(objectName, grabbedObject) {
		var grabs = {};
		
		init();
		return {
			'examine': getGrab,
			'report': report,
			'getGrab': getGrab,
			'getGrabs': function() {  return grabs },
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
		function report(name) {
			var allReports = [];
			for(var g in grabs) {
				var reports = grabs[g].reportAll(name+"."+grabs[g].name());
				for(var i=0; i<reports.length; i++) {
					allReports.push(reports[i]);
				}
			}
			return allReports;
		}
		function getGrab(name) {
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
			'isScriptaculous': isScriptaculous,
			'report': report,
			'disableReporting': function() { reportingEnabled = false; },
			'enableReporting': function() { reportingEnabled = true; },
			'reset': function() {}
		}
		function init() {
			
		}
		function isJSSpec() {
			return window.JSSpec != null;
		}
		function isScriptaculous() {
			return window.Test != null && window.Test.Unit != null && window.Test.Unit.Runner != null;
		}
		function report(message, testCase) {
			if(!reportingEnabled) { return; }
			if(isScriptaculous()) {
				testCase.fail(message);
			} else if(isJSSpec()) {
				throw new Error(message);
			}
		}
	}
})(); // END HIDING FROM GLOBAL SCOPE












































