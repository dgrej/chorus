/*
 * Sidebar artist list
 */
app.AristsListView = Backbone.View.extend({

  tagName:'ul',

  className:'nav nav-list',

  initialize:function () {
    var self = this;
    this.model.on("reset", this.render, this);
    this.model.on("add", function (artist) {
      self.$el.append(new app.ArtistListItemView({model:artist}).render().el);
    });
  },

  render:function () {
    this.$el.empty();

    _.each(this.model.models, function (artist) {
      this.$el.append(new app.ArtistListItemView({model:artist}).render().el);
    }, this);
    return this;
  }
});

app.ArtistListItemView = Backbone.View.extend({

  tagName:"li",

  className: 'artist',

  events:{
    "click .play-artist": "playArtist"
  },

  initialize:function () {
    this.model.on("change", this.render, this);
    this.model.on("destroy", this.close, this);
  },

  render:function () {
    this.$el.html(this.template(this.model.attributes));

 /*   $('.album-small-item img').resizecrop({
      width:40,
      height:60,
      vertical:"top"
    });*/

    return this;
  },

  playArtist: function(e){
    e.preventDefault();
    // clear playlist. add artist, play first song
    var artist = this.model.attributes;
    app.AudioController.playlistClearAdd( 'artistid', artist.artistid, function(result){
      app.AudioController.playPlaylistPosition(0, function(){
        app.AudioController.playlistRefresh();
      });
    });

  }

});



/*
 * Random Size Block view (ordering is still left to the model)
 */
app.AristsRandView = Backbone.View.extend({

  tagName:'ul',

  className:'random-block',

  initialize:function () {

    var self = this;
    this.model.on("reset", this.render, this);
    this.model.on("add", function (artist) {
      self.$el.append(new app.ArtistLargeItemView({model:artist}).render().el);
    });
  },

  render:function () {
    this.$el.empty();

    _.each(this.model.models, function (artist) {
      this.$el.append(new app.ArtistLargeItemView({model:artist}).render().el);
    }, this);


    return this;
  }
});

app.ArtistLargeItemView = Backbone.View.extend({

  tagName:"li",
  className:'artist-item-large card card-large',

  initialize:function () {
    this.model.on("change", this.render, this);
    this.model.on("destroy", this.close, this);
  },

  events: {
    "click .artist-play": "playArtist",
    "click .artist-add": "addArtist",
    "click .artist-thumbsup": "thumbsUp",
    "click .actions-wrapper": "viewArtist"
  },

  render:function () {
    var model = this.model.attributes;

    // enrich the model
    model.title = ( typeof model.label != "undefined" ? model.label : model.artist );
    model.url = '#album/' + model.artistid;
    model.img = (model.fanart != '' ? model.fanart : model.thumbnail);

    this.$el.html(this.template(model));

    // classes
    if(!app.helpers.isDefaultImage(model.img)){
      this.$el.addClass('has-thumb');
    }
    if(app.playlists.isThumbsUp('artist', model.artistid)){
      this.$el.addClass('thumbs-up');
    }


    return this;
  },

  playArtist: function(e){
    e.stopPropagation();
    e.preventDefault();
    // clear playlist. add artist, play first song
    var artist = this.model.attributes;
    app.AudioController.playlistClearAdd( 'artistid', artist.artistid, function(result){
      app.AudioController.playPlaylistPosition(0, function(){
        app.notification('Now playing ' + artist.artist);
        app.AudioController.playlistRefresh();
      });
    });

  },

  addArtist: function(e){
    e.stopPropagation();
    e.preventDefault();
    // clear playlist. add artist, play first song
    var artist = this.model.attributes;
    app.AudioController.playlistAdd( 'artistid', artist.artistid, function(result){
      app.notification(artist.artist + ' added to the playlist');
      app.AudioController.playlistRefresh();
    });

  },

  thumbsUp: function(e){
    e.stopPropagation();
    e.preventDefault();
    var artist = this.model.attributes,
      artistid = artist.artistid,
      op = (app.playlists.isThumbsUp('artist', artistid) ? 'remove' : 'add'),
      $el = $(e.target).closest('.card');
    app.playlists.setThumbsUp(op, 'artist', artistid);
    $el.toggleClass('thumbs-up');

  },


  viewArtist: function(e){
    e.stopPropagation();
    window.location = '#artist/' + this.model.attributes.artistid;
  }

});


