import React from 'react';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import EventForm from './EventForm';
import moment from 'moment';


class Edit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      redirectToEvent: false,
      eventId: props.match.params.id,
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

  componentDidMount() {
    axios.get(`/api/events/${this.state.eventId}`)
    .then(response => {
      let tags = response.data.invitations.map(invitation => {
        return {id: invitation.id, text: invitation.email};
      });      
      this.setState({
        eventName: response.data.title,
        deliveryTime: moment(response.data.delivery_time).format('YYYY-MM-DDTHH:mm:ss'),
        firstName: response.data.recipient.first_name,
        lastName: response.data.recipient.last_name,
        email: response.data.recipient.email,
        tags: tags
      });
    })
    .catch(error => {
      console.log('Error in Event data query', error);
    });
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
    let tag = tags.splice(i, 1);
    this.setState({tags: tags});
    this.removeInvite(tag[0]);
  }

  removeInvite(invite) {
    axios({
      method: 'delete',
      url: `/api/invitations/${invite.id}`,
      data: {
        eventId: this.state.eventId
      }
    }).then(function(response) {

    }).catch(function(error) {
      console.log(error);
    });
  }

  handleAddition(tag) {
    axios({
      method: 'post',
      url: '/api/invitations',
      data: {
        eventId: this.state.eventId,
        email: tag
      }
    }).then(response => {
      let tags = this.state.tags;
      tags.push({
        id: response.data.id,
        text: tag
      });
      this.setState({tags: tags});
    }).catch(error => {
      console.log(error);
    });
  }

  handleSubmit(event) {
    axios({
      method: 'put',
      url: `/api/events/${this.state.eventId}`,
      data: {
        eventName: this.state.eventName,
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        email: this.state.email,
        deliveryTime: this.state.deliveryTime
      }
    }).then(response => {
      this.setState({redirectToEvent: true});
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
                <h1 style={{marginBottom: '2rem' }}>Edit your PepClock</h1>
            </div>
          </div>
          <EventForm
            handleChange={this.handleChange}
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

export default Edit;
