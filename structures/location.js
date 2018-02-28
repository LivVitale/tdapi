var request = require('request-promise');

/**
 * Location class
 * @constructor
 * @param    {TDAPI}   client       - The TDAPI client the location belongs to.
 * @param    {Object}  properties   - The properties to be initialized on the Location object (see: Properties).
 * 
 * @property {Number} ID - The location ID.
 * @property {String} Name - The location name.
 * @property {String} Description - The description.
 * @property {String} ExternalID - The external identifier for the location.
 * @property {Boolean} IsActive - The active status.
 * @property {String} Address - The address.
 * @property {String} City - The city.
 * @property {String} State - The state/province.
 * @property {String} PostalCode - The postal code.
 * @property {String} Country - The country.
 * @property {Boolean} IsRoomRequired - A value indicating whether the location requires a room when specified for an asset.
 * @property {Number} AssetsAcount - The number of assets associated with this location.
 * @property {Number} TicketsCount - The number of tickets associated with this location.
 * @property {Number} RoomsCount - The number of rooms associated with this location.
 * @property {LocationRoom[]} Rooms - The rooms associated with this location.
 * @property {Date} CreatedDate - The created date.
 * @property {Guid} CreatedUid - The UID of the creator.
 * @property {String} CreatedFullName - The full name of the creator.
 * @property {Date} ModifiedDate - The last modified date.
 * @property {Guid} ModifiedUid - The UID of the last person to modify the location.
 * @property {String} ModifiedFullName - The full name of the last person to modify the location.
 * @property {Number|null} Latitude - The latitude of the location.
 * @property {Number|null} Longitude - The longitude of the location.
 */
function Location(client, properties) {
  this.client = client;
  Object.defineProperty(this, 'client', { enumerable: false, configurable: false});

  if(properties) this.init(properties);
}

Location.prototype.init = function(properties) {
  for(var property in properties) {
    this[property] = properties[property];
  }
};

/**
 * Edits the location.
 * @returns {Promise<Location>} location
 */
Location.prototype.edit = function() {
  return this.client.login()
    .then(bearerToken => {
      return request({
        method: 'PUT',
        url: `${this.client.baseUrl}/locations/${this.ID}`,
        auth: { bearer: bearerToken },
        json: true,
        body: this
      });
    })
    .catch(handleError);
};

/**
 * Creates a room in the location.
 * @param   {LocationRoom} room - The room to add to the location.
 * @returns {Promise<LocationRoom>} room
 */
Location.prototype.createRoom = function(room) {
  return this.client.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.client.baseUrl}/locations/${this.ID}/rooms`,
        auth: { bearer: bearerToken },
        json: true,
        body: room
      });
    })
    .catch(handleError);
};

/**
 * Deletes a room in the location.
 * @param {Number} roomId - The ID of the room to delete.
 * @returns {Promise<Object>} message
 */
Location.prototype.deleteRoom = function(roomId) {
  return this.client.login()
    .then(bearerToken => {
      return request({
        method: 'DELETE',
        url: `${this.client.baseUrl}/locations/${this.ID}/rooms/${roomId}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Edits the specified room in the location.
 * @param {Number} roomId - The ID of the room to edit.
 * @returns {Promise<LocationRoom>} room
 */
Location.prototype.editRoom = function(roomId) {
  return this.client.login()
    .then(bearerToken => {
      return request({
        method: 'PUT',
        url: `${this.client.baseUrl}/locations/${this.ID}/rooms/${roomId}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

// Generic error handling - TODO: Improve error detail
function handleError(err) {
  return Promise.reject(err);
}

module.exports = Location;