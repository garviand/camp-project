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
    // Sequentially load and compile all data, then set loaded to true
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
      const url = 'https://lamppoststudios.api-us1.com/api/3/contacts';
      const params = {
        include: 'contactTags.tag,deals,contactData',
        limit: 100
      }
      Utils.get(url, params, (response) => {
        this.setState({
          contacts: response.contacts
        }, () => {
          resolve(response);
        });
      });
    })
  }

  compileDeals(response) {
    return new Promise((resolve, reject) => {
      let deals = {}
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
      let locations = {}
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
      let tags = {}
      response.tags.forEach((tag) => {
        // If tag object doesn't exist, create
        if (!(tag.id in tags)) {
          tags[tag.id] = tag.tag
        }
      });
      // Next, add mappings to specific contacts
      let mappings = {}
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
        <table className="contact_table">
          <thead>
            <tr className="contact_table-header">
              <th>Contact</th>
              <th>Total Value</th>
              <th>Location</th>
              <th className="contact_table-cell-centered">Deals</th>
              <th>Tags</th>
            </tr>
          </thead>
          <tbody>
            {this.state.dataLoaded &&
              this.state.contacts.map((contact) => {
                let value = 0;
                let deals = 0;
                if (contact.id in this.state.deals) {
                  value = this.state.deals[contact.id].value
                  deals = this.state.deals[contact.id].count
                }
                let location = '';
                if (contact.id in this.state.locations) {
                  let _location = this.state.locations[contact.id]
                  let locationSegments = ['city', 'state', 'country'].filter(function(field) {
                    return _location[field].trim().length > 0;
                  }).map(function(field) {
                    return _location[field];
                  })
                  location = locationSegments.join(', ')
                }
                let tags = '';
                if (contact.id in this.state.tags) {
                  tags = this.state.tags[contact.id].join(', ')
                }
                return (
                  <tr key={contact.email} className="contact_table-row">
                    <td className="contact_table-cell-name">{contact.firstName} {contact.lastName}</td>
                    <td>${value.toLocaleString()}</td>
                    <td className="contact_table-cell-location">{location}</td>
                    <td className="contact_table-cell-centered">{deals}</td>
                    <td className="contact_table-cell-tags">{tags}</td>
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
