
SucceedingTest = TestCase("SucceedingTest");

SucceedingTest.prototype.testExpectedFunctionIsCalled = function() {
	jack(function(){
		jack.expect("myGlobalFunction");
		myGlobalFunction();
	});
};

SucceedingTest.prototype.testExpectedFunctionIsCalledOnObject = function() {
	jack(function(){
		jack.expect("myGlobalObject.functionOne");
		myGlobalObject.functionOne();
	});
};
