import React from 'react';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import EventForm from './EventForm';
import moment from 'moment';

class Create extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redirectToEvent: false,
      eventId: 0,
      eventName: '',
      firstName: '',
      lastName: '',
      email: '',
      deliveryTime: '',
      tags: []
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleAddition = this.handleAddition.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleChange(event) {
    var newState = {};
    newState[event.target.name] = event.target.value;
    this.setState(newState);
  }

  handleDateChange(event) {
    this.setState({deliveryTime: moment(event.target.value).format('YYYY-MM-DDTHH:mm:ss')});
  }

  handleKeyPress(target) {
    if (target.charCode === 13) {
      this.handleClick();
    }
  }

  handleDelete(i) {
    let tags = this.state.tags;
    tags.splice(i, 1);
    this.setState({tags: tags});
  }

  handleAddition(tag) {
    let tags = this.state.tags;
    tags.push({
      id: tags.length + 1,
      text: tag
    });
    this.setState({tags: tags});
  }

  handleSubmit(event) {
    let inviteEmails = this.state.tags.map(tag => {
      return tag.text;
    });
    axios({
      method: 'post',
      url: '/api/events',
      data: {
        eventName: this.state.eventName,
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        email: this.state.email,
        deliveryTime: this.state.deliveryTime,
        inviteEmails: inviteEmails
      }
    }).then(response => {
      this.setState({eventId: response.data.id, redirectToEvent: true});
    }).catch(error => {
      console.log(error);
    });
  }

  render() {
    if (this.state.redirectToEvent) {
      return ( <Redirect to={'/events/' + this.state.eventId}/> );
    } else {
      return (
        <div>
          <div className="row justify-content-center">
            <div className="col text-center">
                <h1 style={{marginBottom: '2rem' }}>Create a new PepClock</h1>
            </div>
          </div>
          <EventForm
            handleChange={this.handleChange}
            handleClick={this.handleClick}
            handleDateChange={this.handleDateChange}
            handleKeyPress={this.handleKeyPress}
            handleSubmit={this.handleSubmit}
            handleAddition={this.handleAddition}
            handleDelete={this.handleDelete}
            tags={this.state.tags}
            eventName={this.state.eventName}
            firstName={this.state.firstName}
            lastName={this.state.lastName}
            email={this.state.email}
            deliveryTime={this.state.deliveryTime}
          />
        </div>
      );
    }
  }
}

export default Create;
