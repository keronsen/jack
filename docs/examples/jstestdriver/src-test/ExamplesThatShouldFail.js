
FailingTest = TestCase("Examples that should fail");

FailingTest.prototype.testExpectedFunctionIsNotCalled = function() {
	jack(function(){
		jack.expect("myGlobalFunction");
	});
};

FailingTest.prototype.testExpectedFunctionIsNotCalledOnObject = function() {
	jack(function(){
		jack.expect("myGlobalObject.functionOne");
	});
};
