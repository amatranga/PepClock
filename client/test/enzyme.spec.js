// EXAMPLE ENZYME TESTS
import React from 'react';
import { expect } from 'chai';
import { shallow, mount, render } from 'enzyme';
import Foo from '../src/components/Foo';

xdescribe('Example Enzyme Test Suite', function() {
  it('contains correct class', function() {
    expect(shallow(<Foo />).contains(<div className="foo" />)).to.equal(true);
  });

  it('contains spec with an expectation', function() {
    expect(shallow(<Foo />).is('.foo')).to.equal(true);
  });

  it('contains one of the foo class', function() {
    expect(mount(<Foo />).find('.foo').length).to.equal(1);
  });
});
