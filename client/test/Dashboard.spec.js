import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { Link } from 'react-router-dom';
import Dashboard from '../src/components/Dashboard';
import EventList from '../src/components/EventList';

describe('Dashboard Component', function() {
  const wrapper = shallow(<Dashboard />);

  it('should contain an "EventList" component', function() {
    expect(wrapper.find(EventList)).to.have.length(1);
  });
});
