
FailingTest = TestCase("Examples that should fail");

FailingTest.prototype.expectedFunctionIsCalled = function() {
	jack(function(){
		
	});
};

FailingTest.prototype.expectedFunctionIsCalledOnObject = function() {
	jack(function(){
		
	});
};
