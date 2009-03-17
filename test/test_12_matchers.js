

describe('Matchers', {
	'Namespace should exist': function() {
		value_of(jack.matchers).should_not_be_undefined();
	}
	,
	'is() should match on equal strings': function() {
		value_of(jack.matchers.is("foo", "foo").result).should_be_true();
	}
	,
	'is() should not match on unequal strings': function() {
		value_of(jack.matchers.is("foo", "bar").result).should_be_false();
	}
	,
	'is() should match on equal numbers': function() {
		value_of(jack.matchers.is(1, 1).result).should_be_true();
	}
	,
	'is() should not match on unequal numbers': function() {
		value_of(jack.matchers.is(1, 2).result).should_be_false();
	}
	,
	'is() should match on equal booleans': function() {
		value_of(jack.matchers.is(true, true).result).should_be_true();
	}
	,
	'is() should not match on unequal booleans': function() {
		value_of(jack.matchers.is(true, false).result).should_be_false();
	}
	,
	'is() should match on equal object references': function() {
		var obj1 = {};
		value_of(jack.matchers.is(obj1, obj1).result).should_be_true();
	}
	,
	'is() should not match on unequal object references': function() {
		var obj1 = {};
		var obj2 = {};
		value_of(jack.matchers.is(obj1, obj2).result).should_be_false();
	}
	,
	'is() should create display values': function() {
		var match = jack.matchers.is("foo", "bar");
		value_of(match.actual).should_be("'foo'");
		value_of(match.expected).should_be("'bar'");
	}
	,
	'isNot() should not match on equal strings': function() {
		value_of(jack.matchers.isNot("foo", "foo").result).should_be_false();
	}
	,
	'isNot() should match on unequal strings': function() {
		value_of(jack.matchers.isNot("foo", "bar").result).should_be_true();
	}
	,
	'isNot() should not match on equal numbers': function() {
		value_of(jack.matchers.isNot(1, 1).result).should_be_false();
	}
	,
	'isNot() should match on unequal numbers': function() {
		value_of(jack.matchers.isNot(1, 2).result).should_be_true();
	}
	,
	'isNot() should not match on equal booleans': function() {
		value_of(jack.matchers.isNot(true, true).result).should_be_false();
	}
	,
	'isNot() should match on unequal booleans': function() {
		value_of(jack.matchers.isNot(true, false).result).should_be_true();
	}
	,
	'isNot() should not match on equal object references': function() {
		var obj1 = {};
		value_of(jack.matchers.isNot(obj1, obj1).result).should_be_false();
	}
	,
	'isNot() should match on unequal object references': function() {
		var obj1 = {};
		var obj2 = {};
		value_of(jack.matchers.isNot(obj1, obj2).result).should_be_true();
	}
	,
	'isNot() should create display values': function() {
		var match = jack.matchers.isNot("foo", "bar");
		value_of(match.actual).should_be("'foo'");
		value_of(match.expected).should_be("not:'bar'");
	}
	,
	'matches() should match with regular expressions': function() {
		var testString = "Homer Simpson is 40 years old...";
		value_of(jack.matchers.matches(testString, /Homer/).result).should_be_true();
		value_of(jack.matchers.matches(testString, /Flanders/).result).should_be_false();
		value_of(jack.matchers.matches(testString, /^Homer/).result).should_be_true();
		value_of(jack.matchers.matches(testString, /Simpson$/).result).should_be_false();
		value_of(jack.matchers.matches(testString, /\d{2}/).result).should_be_true();
		value_of(jack.matchers.matches(testString, /\d{3}/).result).should_be_false();
	}
	,
	'matches() should create display values': function() {
		var match = jack.matchers.matches("Homer",/^Homer/);
		value_of(match.actual).should_be("'Homer'");
		value_of(match.expected).should_be("matching:/^Homer/");
	}
	,
	'hasProperty(a, b) should match if b is a property of a': function() {
		value_of(jack.matchers.hasProperty({property1:'value1'}, "property1").result).should_be_true();
	}
	,
	'hasProperty(a, b) should not match if b is not a property of a': function() {
		value_of(jack.matchers.hasProperty({property1:'value1'}, "property2").result).should_be_false();
	}
	,
	'hasProperty(a, b, c) should match if b is a property of a with value c': function() {
		value_of(jack.matchers.hasProperty({property1:'value1'}, "property1", "value1").result).should_be_true();
	}
	,
	'hasProperty(a, b, c) should not match if b is a property of a with a value other than c': function() {
		value_of(jack.matchers.hasProperty({property1:'value1'}, "property1", "value2").result).should_be_false();
	}
	,
	'hasProperty(a, b, c) should not match if b is not a property of a': function() {
		value_of(jack.matchers.hasProperty({property1:'value1'}, "property2", "value2").result).should_be_false();
	}
	,
	'hasProperty(a, b) should create display values': function() {
		var match = jack.matchers.hasProperty({x:'y'},'z');
		value_of(match.expected).should_be("property:'z'");
		value_of(match.actual).should_be("{x:'y'}");
	}
	,
	'hasProperty(a, b, c) should create display values': function() {
		var match = jack.matchers.hasProperty({x:'y'},'z','v');
		value_of(match.expected).should_be("property:{z:'v'}");
		value_of(match.actual).should_be("{x:'y'}");
	}
	,
	'hasProperties() should match if all properties have the expected values': function() {
		var objectUnderTest = {
			property1: 'value1',
			property2: 'value2'
		}
		var propertyCheck = {
			property1: 'value1',
			property2: 'value2'
		}
		value_of(jack.matchers.hasProperties(objectUnderTest, propertyCheck).result).should_be_true();
	}
	,
	'hasProperties() should not match if one of the properties have the wrong value': function() {
		var objectUnderTest = {
			property1: 'value1',
			property2: 'value2'
		}
		var propertyCheck = {
			property1: 'value1',
			property2: 'somethingElse'
		}
		value_of(jack.matchers.hasProperties(objectUnderTest, propertyCheck).result).should_be_false();
	}
	,
	'hasProperties() should not match if one of the properties is missing': function() {
		var objectUnderTest = {
			property1: 'value1'
		}
		var propertyCheck = {
			property1: 'value1',
			property2: 'value2'
		}
		value_of(jack.matchers.hasProperties(objectUnderTest, propertyCheck).result).should_be_false();
	}
	,
	'hasProperties() should match if the object has extra properties': function() {
		var objectUnderTest = {
			property1: 'value1',
			property2: 'value2',
			property3: 'value3'
		}
		var propertyCheck = {
			property1: 'value1',
			property2: 'value2'
		}
		value_of(jack.matchers.hasProperties(objectUnderTest, propertyCheck).result).should_be_true();
	}
	,
	'hasProperties() should create display values': function() {
		var objectUnderTest = {
			property1: 'value1',
			property2: 'value2',
			property3: 'value3'
		}
		var propertyCheck = {
			property1: 'value1',
			property2: 'value2'
		}
		var match = jack.matchers.hasProperties(objectUnderTest, propertyCheck);
		value_of(match.actual).should_be("{property1:'value1',property2:'value2',property3:'value3'}");
		value_of(match.expected).should_be("properties:{property1:'value1',property2:'value2'}");
	}
	,
	'isType() should match strings': function() {
		var aString = "A string";
		var notAString = 1001;
		value_of(jack.matchers.isType(aString, 'string').result).should_be_true();
		value_of(jack.matchers.isType(notAString, 'string').result).should_be_false();
	}
	,
	'isType() should match numbers': function() {
		var aNumber = 1001;
		var notANumber = "A string";
		value_of(jack.matchers.isType(aNumber, 'number').result).should_be_true();
		value_of(jack.matchers.isType(notANumber, 'number').result).should_be_false();
	}
	,
	'isType() should create display values': function() {
		var match = jack.matchers.isType(1001,'string');
		value_of(match.actual).should_be("1001");
		value_of(match.expected).should_be("type:'string'");
	}
	,
	'isGreaterThan(a, b) should match when a is greater than b': function() {
		value_of(jack.matchers.isGreaterThan(1, 0).result).should_be_true();
	}
	,
	'isGreaterThan(a, b) should not match when a is less than b': function() {
		value_of(jack.matchers.isGreaterThan(0, 1).result).should_be_false();
	}
	,
	'isGreaterThan() should create display values': function() {
		var match = jack.matchers.isGreaterThan(0, 1);
		value_of(match.actual).should_be("0");
		value_of(match.expected).should_be(">1");
	}
	,
	'isLessThan(a, b) should match when a is less than b': function() {
		value_of(jack.matchers.isLessThan(0, 1).result).should_be_true();
	}
	,
	'isLessThan(a, b) should not match when a is greater than b': function() {
		value_of(jack.matchers.isLessThan(1, 0).result).should_be_false();
	}
	,
	'isLessThan() should create display values': function() {
		var match = jack.matchers.isLessThan(1, 0);
		value_of(match.actual).should_be("1");
		value_of(match.expected).should_be("<0");
	}
	,
	'isOneOf(a, b, c, d, ...) should match if a equals one of the following arguments': function() {
		value_of(jack.matchers.isOneOf('y','x','y','z').result).should_be_true();
	}
	,
	'isOneOf(a, b, c, d, ...) should not match if b is not an element of a': function() {
		value_of(jack.matchers.isOneOf('y','x','z').result).should_be_false();
	}
	,
	'isOneOf() should create display values': function() {
		var match = jack.matchers.isOneOf('y','x','y','z');
		value_of(match.actual).should_be("'y'");
		value_of(match.expected).should_be("oneOf:['x','y','z']");
	}
});



describe('Display values for matcher arguments', {
	'Should wrap string values in single qoutes': function() {
		value_of(jack.util.displayValue("Homer")).should_be("'Homer'");
	}
	,
	'Should convert numbers to strings': function() {
		value_of(jack.util.displayValue(1001)).should_be("1001");
	}
	,
	'Should convert booleans to strings': function() {
		value_of(jack.util.displayValue(true)).should_be("true");
	}
	,
	'Should wrap arrays in [] and convert values to display values': function() {
		value_of(jack.util.displayValue(["Homer",1001,true])).should_be("['Homer',1001,true]");
	}
	,
	'Should convert null to string': function() {
		value_of(jack.util.displayValue(null)).should_be("null");
	}
	,
	'Should convert undefined to string': function() {
		value_of(jack.util.displayValue(undefined)).should_be("undefined");
	}
	,
	'Should serialize objects': function() {
		value_of(jack.util.displayValue({x:'y'})).should_be("{x:'y'}");
	}
	,
	'Should show plain regex\'es': function() {
		value_of(jack.util.displayValue(/^Homer$/)).should_be("/^Homer$/");
	}
	,
	'Should support prefixing': function() {
		value_of(jack.util.displayValue("not:", "Homer")).should_be("not:'Homer'");
	}
});













