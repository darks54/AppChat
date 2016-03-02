(function($){

  var socket = io.connect(lien);
  var msgtpl= false;
  var lastmsg = false;
  $.ajax({
   type: "GET",
   url: "/message",
   success: function(msg){
     msgtpl= msg;
   }
  });

  var creatTooltip = function(e) {
      // Récupérer la valeur de l'attribut title et l'assigner à une variable
      var tip = $(this).attr('title');

      // Supprimer la valeur de l'attribut title pour éviter l'infobulle native
      $(this).attr('title','');

      // Insérer notre infobulle avec son texte dans la page
      $(this).after('<div id="tooltip"><div class="tipHeader"></div><div class="tipBody">' + tip + '</div><div class="tipFooter"></div></div>');

      // Ajuster les coordonnées de l'infobulle
      $('#tooltip').css('top', e.pageY + 10 );
      $('#tooltip').css('left', e.pageX + 20 );

      // Faire apparaitre l'infobulle avec un effet fadeIn
      $('#tooltip').fadeIn('500');
      $('#tooltip').fadeTo('10',0.8);

  };

  var moveTooltip = function(e) {
      // Ajuster la position de l'infobulle au déplacement de la souris
      $('#tooltip').css('top', e.pageY + 10 );
      $('#tooltip').css('left', e.pageX + 20 );
    };

  var delTooltip = function() {
      // Réaffecter la valeur de l'attribut title
      $(this).attr('title',$('.tipBody').html());
      // Supprimer notre infobulle
      $('div#tooltip').remove();
  };

  var lastmsg = false;

  $('#msgtpl').remove();

  $('#loginform').submit(function(event){
    event.preventDefault();
    socket.emit('login', {
      username : $('#username').val(),
      mail : $('#mail').val()
    })
  });

  socket.on('logged', function(){
    $('#login').fadeOut();
    $('#message').focus();
  });

  /**
  * Envois de message
  **/
  $('#form').submit(function(event){
    event.preventDefault();
    socket.emit('newmsg', {message: $('#message').val()});
    $('#message').val('');
    $('#message').focus();
  });

  /**
  * Reception d'un message
  **/
  socket.on('newmsg', function(message){
    if(lastmsg != message.user.id){
      $('#messages').append('<div class="sep"></div>');
      lastmsg = message.user.id;
    }
    $('#messages').append(Mustache.render(msgtpl, message));
    $('#messages').animate({scrollTop : $('#messages').prop('scrollHeight')}, 500);
  });

  /**
  * Gestion des connectés
  **/
  socket.on('newusr', function(user){
    $('#users').append('<img src="' + user.avatar + '" id="' + user.id + '" title ="' + user.username + '" rel="tooltip">');
    $('#'+user.id).mouseover(creatTooltip);
    $('#'+user.id).mousemove(moveTooltip);
    $('#'+user.id).mouseout(delTooltip);
  });

  socket.on('disusr', function(user){
    $('#' + user.id).remove();
  });
})(jQuery);
