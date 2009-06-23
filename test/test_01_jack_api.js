

describe('Jack API', {
	before_all: function() {
		jack.env.disableReporting();
	}
	,
	after_all: function() {
		jack.env.enableReporting();
	}
	,
	'Should have a global jack() function': function() {
		value_of(typeof jack).should_be("function");
	}
	,
	'Should take a function as parameter and run it': function() {
		var functionHasBeenRun = false;
		jack(function(){
			functionHasBeenRun = true;
		});
		value_of(functionHasBeenRun).should_be_true();
	}
	,
	'Should be able to grab a global function and know if it has been run': function() {
		var realFunctionHasBeenRun = false;
		window.globalTestFunction = function() {
			realFunctionHasBeenRun = true;
		}
		
		jack(function(){
			jack.grab("globalTestFunction");
			globalTestFunction();
		});
		
		value_of(realFunctionHasBeenRun).should_be_true();
		value_of(jack.inspect("globalTestFunction").times()).should_be(1);
		
		window.globalTestFunction = null;
	}
	,
	'Should call grabbed functions with same arguments': function() {
		var calledParameter1 = "";
		var calledParameter2 = "";
		window.globalTestFunction = function(p1, p2) {
			calledParameter1 = p1;
			calledParameter2 = p2;
		}
		
		jack(function(){
			jack.grab("globalTestFunction");
			globalTestFunction("value1","value2");
		});
		
		value_of(calledParameter1).should_be("value1");
		value_of(calledParameter2).should_be("value2");
		
		window.globalTestFunction = null;
	}
	,
	'Should call grabbed functions with same this reference': function() {
		var expectedThis = "This is this!";
		var calledThis = null;
		window.globalTestFunction = function(p1, p2) {
			calledThis = this;
		}
		
		jack(function(){
			jack.grab("globalTestFunction");
			globalTestFunction.call(expectedThis);
		});
		
		value_of(calledThis).should_be(expectedThis);
		
		window.globalTestFunction = null;
	}
	,
	'Should return value from grabbed function': function() {
		var expectedReturnValue = "This is the return value!";
		var actualReturnValue = null;
		window.globalTestFunction = function(p1, p2) {
			return expectedReturnValue;
		}
		
		jack(function(){
			jack.grab("globalTestFunction");
			actualReturnValue = globalTestFunction();
		});
		
		value_of(actualReturnValue).should_be(expectedReturnValue);
		
		window.globalTestFunction = null;
	}
	,
	'Should reset global functions when finished': function() {
		var realFunctionHasBeenRun = false;
		window.globalTestFunction = function() {}
		var referenceToGlobalTestFunction = globalTestFunction;
		
		jack(function(){
			value_of(globalTestFunction === referenceToGlobalTestFunction).should_be_true();
			jack.grab("globalTestFunction");
			value_of(globalTestFunction === referenceToGlobalTestFunction).should_be_false();
		});
		
		value_of(globalTestFunction === referenceToGlobalTestFunction).should_be_true();
		
		window.globalTestFunction = null;
	}
	,
	'Should be able to grab all of an objects functions': function() {
		var realFunctionOneHasBeenRun = false;
		var realFunctionTwoHasBeenRun = false;
		var realFunctionThreeHasBeenRun = false;
		window.globalObject = {};
		window.globalObject.functionOne = function() { realFunctionOneHasBeenRun = true; }
		window.globalObject.functionTwo = function() { realFunctionTwoHasBeenRun = true; }
		window.globalObject.functionThree = function() { realFunctionThreeHasBeenRun = true; }
		
		jack(function(){
			jack.grab("globalObject");
			globalObject.functionOne();
			globalObject.functionTwo();
			globalObject.functionTwo();
		});
		
		value_of(realFunctionOneHasBeenRun).should_be_true();
		value_of(realFunctionTwoHasBeenRun).should_be_true();
		value_of(realFunctionThreeHasBeenRun).should_be_false();
		value_of(jack.inspect("globalObject.functionOne").times()).should_be(1);
		value_of(jack.inspect("globalObject.functionTwo").times()).should_be(2);
		value_of(jack.inspect("globalObject.functionThree").times()).should_be(0);
		
		window.globalObject = null;
	}
	,
	'Should reset global objects function when finished': function() {
		window.globalObject = {};
		window.globalObject.functionOne = function() {}
		window.globalObject.functionTwo = function() {}
		window.globalObject.functionThree = function() {}
		var functionOneReference = globalObject.functionOne;
		var functionTwoReference = globalObject.functionTwo;
		var functionThreeReference = globalObject.functionThree;
		
		jack(function(){
			value_of(globalObject.functionOne === functionOneReference).should_be_true();
			value_of(globalObject.functionTwo === functionTwoReference).should_be_true();
			value_of(globalObject.functionThree === functionThreeReference).should_be_true();
			jack.grab("globalObject");
			value_of(globalObject.functionOne === functionOneReference).should_be_false();
			value_of(globalObject.functionTwo === functionTwoReference).should_be_false();
			value_of(globalObject.functionThree === functionThreeReference).should_be_false();
		});
		
		value_of(globalObject.functionOne === functionOneReference).should_be_true();
		value_of(globalObject.functionTwo === functionTwoReference).should_be_true();
		value_of(globalObject.functionThree === functionThreeReference).should_be_true();
		
		window.globalObject = null;
	}
	,
	'Should be able to grab one of an objects functions': function() {
		var realFunctionOneHasBeenRun = false;
		var realFunctionTwoHasBeenRun = false;
		var realFunctionThreeHasBeenRun = false;
		window.globalObject = {};
		window.globalObject.functionOne = function() { realFunctionOneHasBeenRun = true; }
		window.globalObject.functionTwo = function() { realFunctionTwoHasBeenRun = true; }
		window.globalObject.functionThree = function() { realFunctionThreeHasBeenRun = true; }
		
		jack(function(){
			jack.grab("globalObject.functionTwo");
			globalObject.functionOne();
			globalObject.functionTwo();
		});
		
		value_of(realFunctionOneHasBeenRun).should_be_true();
		value_of(realFunctionTwoHasBeenRun).should_be_true();
		value_of(realFunctionThreeHasBeenRun).should_be_false();
		value_of(jack.inspect("globalObject.functionTwo").times()).should_be(1);
		value_of(jack.inspect("globalObject.functionThree")).should_be_undefined();
		value_of(jack.inspect("globalObject.functionOne")).should_be_undefined();
		
		window.globalObject = null;
	}
	,
	'Should be able to grab a single function from a non-global, specified object)': function() {
		var realFunctionOneHasBeenRun = false;
		var realFunctionTwoHasBeenRun = false;
		var localObject = {};
		localObject.functionOne = function() { realFunctionHasBeenRun = true; }
		localObject.functionTwo = function() { realFunctionTwoHasBeenRun = true; }
		
		jack(function(){
			jack.grab(localObject, "functionOne").stub();
			localObject.functionOne();
			localObject.functionTwo();
		});
		
		value_of(realFunctionOneHasBeenRun).should_be_false();
		value_of(realFunctionTwoHasBeenRun).should_be_true();
	}
	,
	'Should be able to create an object with stubbed functions on the fly': function() {
		var mockFunctionWasCalled = false;
		jack(function(){
			var mockObject = jack.create("myMock",['functionOne','functionTwo']);
			jack.expect("myMock.functionOne").mock(function() {
				mockFunctionWasCalled = true;
			});
			mockObject.functionOne();
		});
		value_of(mockFunctionWasCalled).should_be_true();
	}
	,
	'Should report how well expectations are met': function() {			
		window.bowlingGame = { roll:function(){}, score:function(){} };
		window.functionOne = function() {}
		window.functionTwo = function() {}
		
		jack(function(){
			jack.grab("bowlingGame");
			jack.expect("bowlingGame.roll");
			bowlingGame.score();
			
			jack.grab("functionOne");
			jack.grab("functionTwo");
			jack.expect("functionOne");
			functionOne();
			functionTwo();
			functionTwo();
		});
		
		var bowlingGameRollReport = jack.report("bowlingGame.roll");
		value_of(bowlingGameRollReport.expected).should_be(1);
		value_of(bowlingGameRollReport.actual).should_be(0);
		value_of(bowlingGameRollReport.success).should_be(false);
		value_of(bowlingGameRollReport.fail).should_be(true);
		
		var bowlingGameScoreReport = jack.report("bowlingGame.score");
		value_of(bowlingGameScoreReport.expected).should_be(0);
		value_of(bowlingGameScoreReport.actual).should_be(1);
		value_of(bowlingGameScoreReport.success).should_be(false);
		value_of(bowlingGameScoreReport.fail).should_be(true);
		
		var functionOneReport = jack.report("functionOne");
		value_of(functionOneReport.expected).should_be(1);
		value_of(functionOneReport.actual).should_be(1);
		value_of(functionOneReport.success).should_be(true);
		value_of(functionOneReport.fail).should_be(false);
		
		var functionTwoReport = jack.report("functionTwo");
		value_of(functionTwoReport.expected).should_be(0);
		value_of(functionTwoReport.actual).should_be(2);
		value_of(functionTwoReport.success).should_be(false);
		value_of(functionTwoReport.fail).should_be(true);
		
		window.bowlingGame = null;
		window.functionOne = null;
		window.functionTwo = null;
	}
	,
	'Should assign an expectation id for reporting purposes': function() {
		window.globalTestFunction = function() { }
		
		var expectations = [];
		jack(function(){
			expectations[0] = jack.expect("globalTestFunction").exactly("4 times");
			expectations[1] = jack.expect("globalTestFunction").exactly("9 times");
		});
		
		value_of(expectations[0]._id).should_be(0);
		value_of(expectations[1]._id).should_be(1);
		value_of(jack.report("globalTestFunction",expectations[0]).expected).should_be(4);
		value_of(jack.report("globalTestFunction",expectations[1]).expected).should_be(9);
		
		window.globalTestFunction = null;
	}
	,
	'Should start fresh when jack() is called a second time': function() {
		window.globalTestFunction = function() { }
		
		jack(function(){
			jack.grab("globalTestFunction");
			globalTestFunction();
		});
		value_of(jack.inspect("globalTestFunction").times()).should_be(1);
		
		jack(function(){
			// do nothing
		});
		value_of(jack.inspect("globalTestFunction")).should_be_undefined();
		
		window.globalTestFunction = null;
	}
	,
	'Should be able to stub functions (prevent original function being called)': function() {
		var realJQueryAjaxCalled = false;
		window.jQuery = { 
			ajax:function(){ realJQueryAjaxCalled = true; }
		}
		
		jack(function(){
			var returnValueFromJackStub =
			jack.expect("jQuery.ajax").stub();
			jQuery.ajax();
			value_of(returnValueFromJackStub).should_not_be_undefined();
		});
		
		value_of(realJQueryAjaxCalled).should_be_false();
		
		window.jQuery = null;
	}
	,
	'Should be able to specify mock implementations': function() {
		var realJQueryAjaxCalled = false;
		var mockJQueryAjaxCalled = false;
		var expectedReturnValue = "Return value";
		var actualReturnValue = "";
		window.jQuery = { 
			ajax:function(){ realJQueryAjaxCalled = true; }
		}
		
		jack(function(){
			var returnValueFromJackMock = 
			jack.grab("jQuery.ajax").mock(function(){
				mockJQueryAjaxCalled = true;
				return expectedReturnValue;
			});
			actualReturnValue = jQuery.ajax();
			value_of(returnValueFromJackMock).should_not_be_undefined();
		});
		
		value_of(realJQueryAjaxCalled).should_be_false();
		value_of(mockJQueryAjaxCalled).should_be_true();
		value_of(actualReturnValue).should_be(expectedReturnValue);
		
		
		window.jQuery = null;
	}
	,
	'Should clean up mock implementations': function() {
		var realJQueryAjaxCalled = 0;
		var mockJQueryAjaxCalled = 0;
		window.jQuery = { 
			ajax:function(){ realJQueryAjaxCalled++; }
		}
		
		jack(function(){
			jack.expect("jQuery.ajax").mock(function(){
				mockJQueryAjaxCalled++;
			});
			jQuery.ajax();
		});
		
		jack(function(){
			jack.expect("jQuery.ajax");
			jQuery.ajax();
		});
		
		value_of(realJQueryAjaxCalled).should_be(1);
		value_of(mockJQueryAjaxCalled).should_be(1);
		
		window.jQuery = null;
	}
	,
	'Should call mock implementations with same arguments': function() {
		var calledParameter1 = "";
		var calledParameter2 = "";
		window.jQuery = { 
			ajax:function(p1, p2){}
		}
		
		jack(function(){
			jack.grab("jQuery.ajax").mock(function(p1, p2){
				calledParameter1 = p1;
				calledParameter2 = p2;
			});
			jQuery.ajax("value1","value2");
		});
		
		value_of(calledParameter1).should_be("value1");
		value_of(calledParameter2).should_be("value2");

		window.jQuery = null;
	}
	,
	'Should call mock implementations with same this reference': function() {
		var expectedThis = "This is this!";
		var calledThis = null;
		window.jQuery = { 
			ajax:function(){}
		}
		
		jack(function(){
			jack.grab("jQuery.ajax").mock(function(){
				calledThis = this;
			});
			jQuery.ajax.call(expectedThis);
		});
		
		value_of(calledThis).should_be(expectedThis);

		window.jQuery = null;
	}
	,
	'Should be able to specify a simple mock implementation that just returns a value': function() {
		var expectedReturnValue = "Expected return value";
		var actualReturnValue = null;
		
		jack(function(){
			var mockObject = jack.create("mockObject",['mockFunction']);
			jack.expect("mockObject.mockFunction").returnValue(expectedReturnValue);
			actualReturnValue = mockObject.mockFunction();
		});
		
		value_of(actualReturnValue).should_be(expectedReturnValue);
	}
	,
	'Should be able to specify a mock implementation that returns a series of values': function() {
		var expectedReturnValues = [
			"First expected return value",
			"Second expected return value",
			"Third expected return value" ];
		
		var actualReturnValues = [];
		
		jack(function(){
			var mockObject = jack.create("mockObject",['mockFunction']);
			jack.expect("mockObject.mockFunction").returnValues(
				expectedReturnValues[0], expectedReturnValues[1], expectedReturnValues[2]);
			
			actualReturnValues.push(mockObject.mockFunction());
			actualReturnValues.push(mockObject.mockFunction());
			actualReturnValues.push(mockObject.mockFunction());
		});
		
		value_of(actualReturnValues.shift).should_be(expectedReturnValues[0]);
		value_of(actualReturnValues.shift).should_be(expectedReturnValues[1]);
		value_of(actualReturnValues.shift).should_be(expectedReturnValues[2]);
	}
	,
	'Should not have to call grab() before expect()': function() {
		window.globalFunction = function() {}
		
		jack(function(){
			jack.expect("globalFunction");
		});
		
		var report = jack.report("globalFunction");
		value_of(report.expected).should_be(1);
		
		window.globalFunction = null;
	}		
});
