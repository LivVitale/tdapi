var request = require('request-promise');

/**
 * Ticket class
 * @constructor
 * @param {TDAPI}    client     - The TDAPI client the user belongs to 
 * @param {Object}   properties - The properties to be initialized on the Ticket object (See: Properties)
 * 
 * @property {Number} ID - The ID of the ticket.
 * @property {Number} ParentID - The ID of the parent ticket.
 * @property {String} ParentTitle - The title of the parent ticket.
 * @property {Number} ParentClass - The classification of the parent ticket.
 * @property {Number} TypeID - The ticket type ID.
 * @property {String} TypeName - The ticket type name.
 * @property {Number} TypeCategoryID - The type category ID.
 * @property {String} TypeCategoryName - The type category name.
 * @property {Number} Classification - The ticket classification.
 * @property {String} Title - The ticket title.
 * @property {String} Description - The ticket description.
 * @property {String} Uri - The Uri to retrieve the individual ticket.
 * @property {Number} AccountID - The account/department ID.
 * @property {String} AccountName - The account/department name.
 * @property {Number} SourceID - The source ID.
 * @property {String} SourceName - The source name.
 * @property {Number} StatusID - The status ID.
 * @property {String} StatusName - The status name.
 * @property {Number} StatusClass - The status class.
 * @property {Number} ImpactID - The impact ID.
 * @property {String} ImpactName - The impact name.
 * @property {Number} UrgencyID - The urgency ID.
 * @property {String} UrgencyName - The urgency name.
 * @property {Number} PriorityID - The priority ID.
 * @property {String} PriorityName - The priority name.
 * @property {Number} PriorityOrder - The priority ordering.
 * @property {Number} SlaID - The SLA ID.
 * @property {String} SlaName - The SLA name.
 * @property {Boolean} IsSlaViolated - A value indicating whether the ticket's SLA has been violated.
 * @property {Boolean|null} IsSlaRespondByViolated - A value indicating whether the "Respond By" component of the ticket's SLA has been violated, or null if this has been not loaded.
 * @property {Boolean|null} IsSlaResolveByViolated - A value indicating whether the "Resolve By" component of the ticket's SLA has been violated, or null if this has been not loaded.
 * @property {Date|null} RespondByDate - The "respond by" SLA deadline for the ticket.
 * @property {Date|null} ResolveByDate - The "resolve by" SLA deadline for the ticket.
 * @property {Date|null} SlaBeginDate - The date the ticket started its current SLA.
 * @property {Boolean} IsOnHold - A value indicating  whether the ticket is on hold.
 * @property {Date|null} PlacedOnHoldDate - The date the ticket was placed on hold.
 * @property {Date|null} GoesOffHoldDate - The date the ticket will go off hold.
 * @property {Date} CreatedDate - The created date.
 * @property {Guid} CreatedUid - The UID of the creator.
 * @property {String} CreatedFullName - The full name of the creator.
 * @property {String} CreatedEmail - The email address of the creator.
 * @property {Date} ModifiedDate - The last modified date.
 * @property {Guid} ModifiedUid - The UID of the last person to modify the ticket.
 * @property {String} ModifiedFullName - The full name of the last person to modify the ticket.
 * @property {String} RequestorName - The full name of the requestor.
 * @property {String} RequestorFirstName - The first name of the requestor.
 * @property {String} RequestorLastName - The last name of the requestor.
 * @property {String} RequestorEmail - The email address of the requestor.
 * @property {String} RequestorPhone - The phone number of the requestor.
 * @property {Guid|null} RequestorUid - The UID of the requestor.
 * @property {Number} ActualMinutes - The time, in minutes, entered against the ticket or associated tasks/activities.
 * @property {Number} EstimatedMinutes - The estimated minutes.
 * @property {Number} DaysOld - The age of the ticket, in days.
 * @property {Date|null} StartDate - The start date.
 * @property {Date|null} EndDate - The end date.
 * @property {Guid|null} ResponsibleUid - The UID of the responsible person.
 * @property {String} ResponsibleFullName - The full name of the responsible person.
 * @property {String} ResponsibleEmail - The email address of the responsible person.
 * @property {Number} ResponsibleGroupID - The ID of the responsible group.
 * @property {String} ResponsibleGroupName - The name of the responsible group.
 * @property {Date} RespondedDate - The date the ticket was responded to.
 * @property {Guid|null} RespondedUid - The UID of the person who responded to the ticket.
 * @property {String} RespondedFullName - The full name of the person who responded to the ticket.
 * @property {Date} CompletedDate - The completed/closed date.
 * @property {Guid|null} CompletedUid - The UID of the person who closed the ticket.
 * @property {String} CompletedFullName - The full name of the person who closed the ticket.
 * @property {Guid|null} ReviewerUid - The UID of the reviewing person.
 * @property {String} ReviewerFullName - The full name of the reviewing person.
 * @property {String} ReviewerEmail - The email address of the reviewing person.
 * @property {Number} ReviewingGroupID - The ID of the reviewing group.
 * @property {String} ReviewingGroupName - The name of the reviewing group.
 * @property {Number} TimeBudget - The time budget.
 * @property {Number} ExpensesBudget - The expenses budget.
 * @property {Number} TimeBudgetUsed - The time budget used.
 * @property {Number} ExpensesBudgetUsed - The expenses budget used.
 * @property {Boolean} IsConvertedToTask - A value indicating whether the ticket has been converted to a project task.
 * @property {Date} ConvertedToTaskDate - The date the ticket was converted to a project task.
 * @property {Guid|null} ConvertedToTaskUid - The UID of the person who converted the ticket to a project task.
 * @property {String} ConvertedToTaskFullName - The full name of the person who converted the ticket to a project task.
 * @property {Number} TaskProjectID - The project ID of the associated project task.
 * @property {String} TaskProjectName - The project name of the associated project task.
 * @property {Number} TaskPlanID - The plan ID of the associated project task.
 * @property {String} TaskPlanName - The plan name of the associated project task.
 * @property {Number} TaskID - The ID of the associated project task.
 * @property {String} TaskTitle - The title of the associated project task.
 * @property {Date} TaskStartDate - The start date of the associated project task.
 * @property {Date} TaskEndDate - The end date of the associated project task.
 * @property {Number} TaskPercentComplete - The percent complete of the associated project task.
 * @property {Number} OpportunityID - The ID of the associated CRM opportunity.
 * @property {String} OpporunityName - The name of the associated CRM opportunity.
 * @property {Number} LocationID - The location ID.
 * @property {String} LocationName - The location name.
 * @property {Number} LocationRoomID - The room ID for the ticket's location.
 * @property {String} LocationRoomName - The room name for the ticket's location.
 * @property {String} RefCode - The reference code.
 * @property {Number} ServiceID - The ID of the associated service.
 * @property {String} ServiceName - The name of the associated service.
 * @property {Number} ServiceCategoryID - The ID of the associated service's category.
 * @property {String} ServiceCategoryName - The name of the associated service's category.
 * @property {Number} ArticleID - The ID of the associated knowledge base article.
 * @property {String} ArticleSubject - The subject of the associated knowledge base article.
 * @property {Number} ArticleStatus - The status of the associated knowledge base article.
 * @property {String} ArticleCategoryPathNames - A delimited string describing the category hierarchy of the associated knowledge base article.
 * @property {Number} AppID - The ID of the application to which this ticket belongs.
 * @property {CustomAttribute[]} Attributes - The custom ticket attributes.
 * @property {Attachment[]} Attachments - The ticket attachments.
 * @property {TicketTask[]} Tasks - The ticket tasks.
 * @property {ResourceItem[]} Notify - The list of people who can be notified for a ticket.
 */
function Ticket(client, properties) {
  this.client = client;
  Object.defineProperty(this, 'client', { enumerable: false, configurable: false });

  if(properties) this.init(properties);
}

Ticket.prototype.init = function(properties) {
  for(var property in properties) {
    this[property] = properties[property];
  }
};

/**
 * Adds an asset to the Ticket
 * @param {any} assetId
 * @returns {Promise<Object>} message
 */
Ticket.prototype.addAsset = function(assetId) {
  return this.client.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.client.baseUrl}/${this.AppID}/tickets/${this.ID}/${assetId}`,
        auth: { bearer: bearerToken},
        json: true
      });
    })
    .catch(handleError);
};

/** 
 * Removes an asset from the Ticket
 * @param {any} assetId
 * @returns {Promise<Object>} message
 */
Ticket.prototype.removeAsset = function(assetId) {
  return this.client.login()
    .then(bearerToken => {
      return request({
        method: 'DELETE',
        url: `${this.client.baseUrl}/${this.AppID}/tickets/${this.ID}/${assetId}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Gets the Ticket contacts
 * @returns {Promise<User[]>} contacts
 */
Ticket.prototype.getContacts = function() {
  return this.client.login()
    .then(bearer => {
      return request({
        method: 'GET',
        url: `${this.client.baseUrl}/${this.AppID}/tickets/${this.ID}/contacts`,
        auth: { bearere: bearerToken },
        json: true
      });
    })
    .then(contacts => {
      if(Array.isArray(contacts)) {
        return contacts.map(contact => new User(this.client, contact));
      } else {
        return contacts;
      }
    })
    .catch(handleError);
};

/**
 * Adds a contact to the Ticket
 * @param {Guid} contactUid
 * @returns {Promise<Object>} message
 */
Ticket.prototype.addContact = function(contactUid) {
  return this.client.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.client.baseUrl}/${this.AppID}/tickets/${this.ID}/contacts/${contactUid}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/**
 * Removes a contact from the Ticket
 * @param {Guid} contactUid
 * @returns {Promise<Object>} message
 */
Ticket.prototype.removeContact = function(contactUid) {
  return this.cliemt.login()
    .then(bearerToken => {
      return request({
        method: 'DELETE',
        url: `${this.client.baseUrl}/${this.AppID}/tickets/${this.ID}/contacts/${contactUid}`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/** 
 * Gets the feed entries for the Ticket
 * @returns {Promise<TicketFeedEntry[]>} feedEntries - The ticket's feed entries
 */
Ticket.prototype.getFeedEntries = function() {
  return this.client.login()
    .then(bearerToken => {
      return request({
        method: 'GET',
        url: `${this.client.baseUrl}/${this.AppID}/tickets/${this.ID}/feed`,
        auth: { bearer: bearerToken },
        json: true
      });
    })
    .catch(handleError);
};

/** 
 * Updates the Ticket
 * @param {TicketFeedEntry} ticketFeedEntry - The new feed entry to add
 * @returns {Promise<ItemUpdate>} itemUpdate
 */
Ticket.prototype.update = function(ticketFeedEntry) {
  return this.client.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.client.baseUrl}/${this.AppID}/tickets/${this.ID}/feed`,
        auth: { bearer: bearerToken },
        json: true,
        body: ticketFeedEntry
      });
    })
    .catch(handleError);
};

/**
 * Edits the ticket
 * @param {Boolean} [notifyNewResponsible=false]
 * @returns {Promise<Ticket>} ticket
 */
Ticket.prototype.edit = function(notifyNewResponsible) {
  return this.client.login()
    .then(bearerToken => {
      return request({
        method: 'POST',
        url: `${this.client.baseUrl}/${this.AppID}/tickets/${this.ID}?notifyNewResponsible=${notifyNewResponsible}`,
        auth: { bearer: bearerToken },
        json: true,
        body: this
      });
    })
    .then(ticket => new Ticket(this.client, ticket))
    .catch(handleError);
};

/**
 * Edits the ticket via HTTP PATCH (Edits only specified fields)
 * @param {Boolean} notifyNewResponsible
 * @param {any} patch
 * @returns {Promise<Ticket>} ticket
 */
Ticket.prototype.patch = function(notifyNewResponsible, patch) {
  return this.client.login()
    .then(bearerToken => {
      return request({
        method: 'PATCH',
        url: `${this.client.baseUrl}/${this.AppID}/tickets/${this.ID}?notifyNewResponsible=${notifyNewResponsible}`,
        auth: { bearer: bearerToken },
        json: true,
        body: patch
      });
    })
    .then(ticket => new Ticket(this.client, ticket))
    .catch(handleError);
};

// Generic error handling - TODO: Improve error detail
function handleError(err) {
  return Promise.reject(err);
}

module.exports = Ticket;