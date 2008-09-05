
describe('Setting expectations for functions that also have properties', {
	before_each: function() {
		window.MyQuery = function() {}
		window.MyQuery.post = function() {}
	}
	,
	after_each: function() {
		window.MyQuery = null
	}
	,
	before_all: function() {
		jack.env.disableReporting();
	}
	,
	after_all: function() {
		jack.env.enableReporting();
	}
	,
	'Should register expectations': function() {
		jack(function(){
			jack.expect("MyQuery").exactly("2 times");
			jack.expect("MyQuery.post").exactly("5 time");
		});
		value_of(jack.report("MyQuery").expected).should_be(2);
		value_of(jack.report("MyQuery.post").expected).should_be(5);
	}
	,
	'Should register calls': function() {
		jack(function(){
			jack.expect("MyQuery").exactly("2 times");
			jack.expect("MyQuery.post").exactly("5 time");
			MyQuery("foo");
			MyQuery("foo");
			MyQuery.post("bar");
		});			
		value_of(jack.report("MyQuery").actual).should_be(2);
		value_of(jack.report("MyQuery.post").actual).should_be(1);
	}
});
