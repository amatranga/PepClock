import React from 'react';
import { Link } from 'react-router-dom';
import ContributionList from './ContributionList';
import axios from 'axios';
import moment from 'moment';
import filestack from 'filestack-js';
const client = filestack.init('A03mnfU7QQ6QY8rPMGtfBz');

class Event extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      eventId: props.match.params.id,
      title: '',
      contributionList: [],
      contributionText: '',
      contributionType: '',
      contributionMediaUrl: '',
      hasPermissionToView: null,
      deliveryTime: '',
      recipient: {},
      curSecond: moment().second(),
      curMinute: moment().minute(),
      curHour: moment().hour()
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.updateContributions = this.updateContributions.bind(this);
    this.showPicker = this.showPicker.bind(this);
  }

  componentWillMount () {
    this.checkIfContributor();
  }

  handleChange(event) {
    this.setState({contributionText: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    axios({
      method: 'post',
      url: '/api/contributions',
      data: {
        eventId: this.state.eventId,
        contributionText: this.state.contributionText,
        contributionType: this.state.contributionType,
        contributionMediaUrl: this.state.contributionMediaUrl
      }
    })
    .then(res => {
      this.setState({
        contributionText: '',
        contributionType: '',
        contributionMediaUrl: ''
      });
      this.updateContributions();
    })
    .catch(err => {
      console.log('Error in Event.jsx', err);
    });
  }

  checkIfContributor () {
    axios.get('/api/events/users')
      .then(({ data: events }) => {
        const userEventIds = events.map(event => event.event_id);
        this.setState({
          hasPermissionToView: userEventIds.includes(Number(this.state.eventId))
        });
        this.getEventContent();
      })
      .catch(err => console.error(err));
  }

  updateContributions() {
    axios.get(`/api/contributions/events/${this.state.eventId}`)
      .then(({ data: contributionList}) => {
        this.setState({contributionList});
      })
      .catch(error => {
        console.log('Error in updateContributions query', error);
      });
  }

  getEventContent () {
    axios.get(`/api/events/${this.state.eventId}`)
    .then(({ data: { title, delivery_time: deliveryTime, recipient} }) => {
      this.setState({ title, deliveryTime, recipient });
      this.updateContributions();
    })
    .catch(error => {
      console.log('Error in Event data query', error);
    });
  }

  showPicker(event) {
    event.preventDefault();
    client.pick({accept: ['image/*', 'video/*']})
    .then(result => {
      let type = result.filesUploaded[0].mimetype.slice(0, 5);
      let url = result.filesUploaded[0].url;
      this.setState({contributionType: type, contributionMediaUrl: url});
    });
  }

  render() {
    // This condition prevents the "non-permitted" state
    // from rendering for a flash before rending content.
    if (this.state.hasPermissionToView === null) {
      return <div></div>;
    }

    if (this.state.hasPermissionToView) {
      const { id } = this.props.match.params;
      const { title, description, deliveryTime } = this.state;

      let launchTimeDisplay = moment(deliveryTime).format('MMM Do YYYY || hh : mm');
      let timeOfDay = moment(deliveryTime).format('a');
      let launchDisplay = launchTimeDisplay + ' ' + timeOfDay;
      let timeToLaunch = moment().to(deliveryTime);
      let happen = timeToLaunch.includes('ago') ? 'Happened' : 'Happening';

      const uploadConfirmation = this.state.contributionType
        ? (
            <p className="text-success">
              <span className="text-capitalize">
                {this.state.contributionType}
              </span> successfully uploaded
            </p>
          )
        : null;

    return (
        <div className="row justify-content-center">
          <div className="col col-md-8 text-center">
            <h1>{title}</h1>
            <h4>A PepClock Lovingly Created for {this.state.recipient.first_name} {this.state.recipient.last_name}</h4>
            <h5 className="text-muted">{happen} {timeToLaunch}</h5>
            <h6 className="text-muted">on {launchDisplay}</h6>
            <Link className="btn btn-outline-info" to={`/edit/${id}`}>Edit event</Link>
            <hr />
            <ContributionList contributionList={this.state.contributionList}/>
            <hr />
            <form onSubmit={this.handleSubmit}>

              {uploadConfirmation}
              <textarea
                className="form-control mb-2"
                rows="1"
                onChange={this.handleChange}
                value={this.state.contributionText}
                placeholder="Enter your message">
              </textarea>
              <a className="btn btn-success" href="#" onClick={this.showPicker} style={{margin:'5px'}}>
                <i className="fa fa-picture-o" style={{cursor: 'pointer', color: 'white'}} /> Photo/Video</a>
              <button className="btn btn-primary" style={{margin:'5px'}}>Create Post</button>
            </form>
          </div>
        </div>
      );
    }

    return (
      <div className="row justify-content-center">
        <div className="col-xs-12 text-center">
          <h3>Sorry, this doesn't seem to be one of your events</h3>
          <p>Perhaps you'd like to <Link to="/dashboard">view your events</Link></p>
        </div>
      </div>
    );
  }
}

export default Event;
