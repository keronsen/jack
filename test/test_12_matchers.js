

describe('Matching objects', {
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
});

















