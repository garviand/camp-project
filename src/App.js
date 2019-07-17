import React from 'react';
import Utils from './Utils';
import './App.css';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      dataLoaded: false,
      contacts: null,
      deals: null,
      locations: null,
      tags: null
    };
    this.compileDeals = this.compileDeals.bind(this);
    this.compileLocations = this.compileLocations.bind(this);
    this.compileTags = this.compileTags.bind(this);
  }

  componentDidMount() {
    this.fetchContacts()
    .then(this.compileDeals)
    .then(this.compileLocations)
    .then(this.compileTags)
    .then(() => {
      this.setState({
        dataLoaded: true
      });
    })
  }

  fetchContacts() {
    return new Promise((resolve, reject) => {
      var url = 'https://lamppoststudios.api-us1.com/api/3/contacts';
      var params = {
        include: 'contactTags.tag,deals,contactData',
        limit: 100
      }
      Utils.get(url, params, (response) => {
        this.setState({
          contacts: response.contacts,
          tags: response.tags
        }, () => {
          resolve(response);
        });
      });
    })
  }

  compileDeals(response) {
    return new Promise((resolve, reject) => {
      var deals = {}
      response.deals.forEach((deal) => {
        // If contact deals object doesn't exist, create
        if (!(deal.contact in deals)) {
          deals[deal.contact] = {
            count: 0,
            value: 0
          }
        }
        // Increment deal count and add value to total value
        deals[deal.contact].count++
        deals[deal.contact].value += parseInt(deal.value)
      });
      this.setState({
        deals: deals
      }, () => {
        resolve(response);
      });
    })
  }

  compileLocations(response) {
    return new Promise((resolve, reject) => {
      var locations = {}
      response.contactData.forEach((data) => {
        // If contact locations object doesn't exist, create
        if (!(data.contact in locations)) {
          locations[data.contact] = {
            city: data.geoCity,
            state: data.geoState,
            country: data.geoCountry2
          }
        }
      });
      this.setState({
        locations: locations
      }, () => {
        resolve(response);
      });
    })
  }

  compileTags(response) {
    return new Promise((resolve, reject) => {
      // First, compile tags by id
      var tags = {}
      response.tags.forEach((tag) => {
        // If tag object doesn't exist, create
        if (!(tag.id in tags)) {
          tags[tag.id] = tag.tag
        }
      });
      // Next, add mappings to specific contacts
      var mappings = {}
      response.contactTags.forEach((contactTag) => {
        // If mapping object doesn't exist, create
        if (!(contactTag.contact in mappings)) {
          mappings[contactTag.contact] = []
        }
        // Add tag value to list
        mappings[contactTag.contact].push(tags[contactTag.tag])
      });
      this.setState({
        tags: mappings
      }, () => {
        resolve(response);
      });
    })
  }

  render() {
    return (
      <div className="app">
        <table>
          <tbody>
            <tr>
              <th>Contact</th>
              <th>Total Value</th>
              <th>Location</th>
              <th>Deals</th>
              <th>Tags</th>
            </tr>
            {this.state.dataLoaded &&
              this.state.contacts.map((contact) => {
                var value = 0;
                var deals = 0;
                if (contact.id in this.state.deals) {
                  value = this.state.deals[contact.id].value
                  deals = this.state.deals[contact.id].count
                }
                var location = '';
                if (contact.id in this.state.locations) {
                  var _location = this.state.locations[contact.id]
                  var locationSegments = ['city', 'state', 'country'].filter(function(field) {
                    return _location[field].trim().length > 0;
                  }).map(function(field) {
                    return _location[field];
                  })
                  location = locationSegments.join(', ')
                }
                var tags = '';
                if (contact.id in this.state.tags) {
                  tags = this.state.tags[contact.id].join(', ')
                }
                return (
                  <tr key={contact.email}>
                    <td>{contact.firstName} {contact.lastName}</td>
                    <td>${value}</td>
                    <td>{location}</td>
                    <td>{deals}</td>
                    <td>{tags}</td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
    );
  }

}

export default App;
