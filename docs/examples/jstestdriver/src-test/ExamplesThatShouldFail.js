
FailingTest = TestCase("Examples that should fail");

FailingTest.prototype.testExpectedFunctionIsCalled = function() {
	jack(function(){
		
	});
};

FailingTest.prototype.testExpectedFunctionIsCalledOnObject = function() {
	jack(function(){
		
	});
};
