var Movies = new Meteor.Collection("movies");
var Seats = new Meteor.Collection("seats");
var Rooms = new Meteor.Collection("rooms");

if (Meteor.isClient) {

  Meteor.startup(function() {
    Session.setDefault("bookingMovie", null);
  });

  Template.page.bookingMovie = function() {
    return Session.get("bookingMovie") != null;
  }

  Template.movies.movie = function() {
    return Movies.find();
  }

  Template.movies.rating = function() {
    return getRating(this.rating);
  }

  Template.movies.lang = function() {
    if (this.lang == "en") return "";
    if (this.lang == "nl") return "nederlands gesproken | ";
  }

  Template.times.events({
    'click .book-time': function(evt, data) {
      Seats.update({active: Meteor.userId()}, {$set: {active: false}}, {multi: true});

      $("#booking").addClass("loading");
      var self = this;
      Meteor.setTimeout(function() {
        var bookingData = {time: self.time, imax: self.imax, "3d": self["3d"]};
        bookingData.theatre = evt.target.getAttribute('data-theatre');
        bookingData.movie = data.data;
        Session.set("bookingMovie", bookingData);
        $("#booking").removeClass("loading");
      }, 800);
    }
  });

  Template.booking.events({
    'click #cancel': function() {
      Session.set("bookingMovie", null);
    }
  });

  Template.booking.bookingMovie = function() {
    return Session.get("bookingMovie");
  }

  Template.booking.numTickets = function() {
    return Seats.find({active: Meteor.userId()}).count();
  }

  Template.booking.price = function() {
    return accounting.formatMoney(Template.booking.numTickets() * 9.50 || 0, "€");
  }

  Template.seats.seat = function() {
    var room = Rooms.findOne({movieId: this.movie._id, time: this.time});
    if (room) {
      var roomId = room._id;
      return Seats.find({roomId: roomId});
    }
  }

  Template.seats.status = function() {
    if (this.unavailable) return "unavailable";
    else if (this.taken) return "taken";
    else if (this.active) return "active";
    else return "available";
  }

  Template.seats.events({
    'click .seat': function() {
      if (!this.active && !this.taken && !this.unavailable) {
        Seats.update({_id: this._id}, {$set: {active: Meteor.userId()}});
      }
      else {
        Seats.update({_id: this._id}, {$set: {active: false}});
      }

    }
  });

  function getRating(rating) {
    switch (rating) {
      case 16:
      case 12:
      case 6:
        return rating + " jaar en ouder";
      case 0:
        return "Alle leeftijden";
      default:
        return "Geen classificatie";
    }
  }

  Template.booking.helpers({
    getRating: function(rating) {
      return getRating(rating);
    }
  });
}

if (Meteor.isServer) {

  Meteor.methods({
    addSeats: function() {
      var movies = Movies.find().collection.docs;
      for (var id in movies) {
        var m = movies[id];
        for (var i = 0; i < m.showingAt.length; i++) {
          var s = m.showingAt[i];
          for (var j = 0; j < s.times.length; j++) {
            var time = s.times[j].time;
            var roomId = Rooms.insert({movieId: id, time: time});
            for (var n = 0; n < 244; n++)
              Seats.insert({roomId: roomId, reserved: false, active: false, unavailable: false});
          }
        }
      }
    }
  })

  Meteor.startup(function () {

    if (Movies.find().count() == 0) {

      Movies.insert({
        title: "Hansel & Gretel: Witch Hunters",
        description: 'We volgen "Hansel" en "Gretel" 15 jaar na het incident met het peperkoekhuisje. Hans en Grietje zijn volwaardige heksenjagers geworden...',
        imax: true,
        "3d": true,
        rating: 16,
        lang: "en",
        digital: false,
        image: "http://www.pathe.nl/thumb/75x100/gfx_content/posters/hanselgretelposter3.jpg",
        showingAt: [
          {
            theatre: "Arena",
            times: [
              {time: "12:00", imax: true, "3d": true},
              {time: "16:40", imax: true, "3d": true},
              {time: "21:20", imax: true, "3d": true}
            ]
          },
          {
            theatre: "De Munt",
            times: [
              {time: "10:40", "3d": true},
              {time: "13:00", "3d": true},
              {time: "15:20", "3d": true},
              {time: "17:40", "3d": true},
              {time: "19:30", "3d": true},
              {time: "22:20", "3d": true}
            ]
          }
        ]
      });

      Movies.insert({
        title: "Verliefd op Ibiza",
        description: 'Op het eiland waar veertigers dertig willen zijn, de dertigers twintig willen zijn en de twintigers de weg kwijt zijn, raakt een ensemble van personages verliefd op elkaar, en op Ibiza',
        imax: false,
        "3d": false,
        rating: 12,
        lang: "nl",
        digital: true,
        image: "http://www.pathe.nl/thumb/75x100/gfx_content/posters/verliefdopibizi2.jpg",
        showingAt: [
          {
            theatre: "Arena",
            times: [
              {time: "13:20", imax: false, "3d": false},
              {time: "15:50", imax: false, "3d": false},
              {time: "18:30", imax: false, "3d": false},
              {time: "21:00", imax: false, "3d": false},
            ]
          },
          {
            theatre: "De Munt",
            times: [
              {time: "11:20", imax: false, "3d": false},
              {time: "14:00", imax: false, "3d": false},
              {time: "16:40", imax: false, "3d": false},
              {time: "19:15", imax: false, "3d": false},
              {time: "21:45", imax: false, "3d": false},
            ]
          }
        ]
      });

      Movies.insert({
        title: "A Good Day to Die Hard",
        description: 'Bruce Willis keert terug in zijn meest iconische rol als John McClane - de "ultieme" held die overal en altijd aan het langste eind trekt',
        imax: true,
        "3d": false,
        rating: 12,
        lang: "en",
        digital: false,
        image: "http://www.pathe.nl/thumb/75x100/gfx_content/posters/agooddaytodiehard2(1).jpg",
        showingAt: [
          {
            theatre: "Arena",
            times: [
              {time: "12:00", imax: false, "3d": false},
              {time: "14:20", imax: true, "3d": false},
              {time: "16:30", imax: false, "3d": false},
              {time: "19:00", imax: true, "3d": false},
              {time: "22:00", imax: false, "3d": false},
            ]
          },
          {
            theatre: "City",
            times: [{time: "22:15", imax: false, "3d": false}]
          },
          {
            theatre: "De Munt",
            times: [
              {time: "12:20", imax: false, "3d": false},
              {time: "14:45", imax: false, "3d": false},
              {time: "17:10", imax: false, "3d": false},
              {time: "19:00", imax: false, "3d": false},
              {time: "22:00", imax: false, "3d": false}
            ]
          },
          {
            theatre: "Tuschinski",
            times: [{time: "21:45", imax: false, "3d": false}]
          }
        ]
      });

    }

  });
}
