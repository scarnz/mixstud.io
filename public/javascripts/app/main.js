$(document).ready(initialize);

var socket;

function initialize(){
  $(document).foundation();
  $('#register').on('click', clickRegister);
  $('#login').on('click', clickLogin);
  $('#logout-button').on('click', clickLogout);
  $('#update-email').on('click', clickUpdateEmail);
  $('#update-password').on('click', clickUpdatePassword);
  $('#update-profile').on('click', clickUpdateProfile);
  $('#update-profilePic').on('click', clickUpdateProfilePic);
  $('#upload-button').on('click', clickUploadButton);
}

function zipFileUpload(email,client) {
  var file, fileName;
  file = $('form#upload input[type="file"]')[0].files[0];
  if(file){
    fileName = file.name;
    fileName = email + "/" + fileName;
    client.writeFile(fileName, file, function (error,stat) {
      if (error) {
          alert('ERROR!');
      } else {
          alert('THANK YOU');
      }
    });
  } else {
    alert('Please select a file');
  }
}

function clickUploadButton(e){
  var url = '/upload';
  var data = {};
  sendAjaxRequest(url, data, 'post', null, e, function(response){
    var client = new Dropbox.Client({ key: response.apiKey, secret: response.apiSecret });
    client.authenticate(function(error, client) {
      if (error) {
          console.log('There was an error.');
      } else {
        var dbClient = new Dropbox.Client({
          key         : response.apiKey,
          secret      : response.apiSecret,
          sandbox     : false,
          token       : client.oauth._token,
          tokenSecret : client.oauth._secret
        });
        zipFileUpload(response.email,dbClient);
      }
    });
  });
}

function clickRegister(e){
  var url = '/users';
  var data = $('form#registration').serialize();
  sendAjaxRequest(url, data, 'post', null, e, function(data){
    htmlRegisterComplete(data);
  });
}

function clickLogin(e){
  var url = '/login';
  var data = $('form#authentication').serialize();
  sendAjaxRequest(url, data, 'post', 'put', e, function(data){
    htmlLoginComplete(data);
  });
}

function clickLogout(e){
  var url = '/logout';
  sendAjaxRequest(url, {}, 'post', 'delete', e, function(data){
    window.location = '/login';
  });
}

// Profile Edit

function clickUpdateEmail(e) {
  var url = '/account/email';
  var data = $('form#account').serialize();
  sendAjaxRequest(url, data, 'post', 'put', e, function(data){
    htmlUpdateEmailComplete(data);
  });
}

function clickUpdatePassword(e) {
  var url = '/account/password';
  var data = $('form#account').serialize();
  sendAjaxRequest(url, data, 'post', 'put', e, function(data){
    htmlUpdatePasswordComplete(data);
  });
}

function clickUpdateProfile(e) {
  var url = '/profile/info';
  var data = $('form#profile').serialize();
  sendAjaxRequest(url, data, 'post', 'put', e, function(data){
    htmlUpdateProfileInfoComplete(data);
  });


}

function clickUpdateProfilePic(e) {
  alert();


}

function htmlRegisterComplete(data) {
  switch(data.status){
    case 'ok':
      window.location = '/login?signup=true';
    break;
    case 'invalid':
      $('p#register-error').text(data.message);
    break;
    case 'emailexists':
      $('p#register-error').text(data.message);
    break;
    case 'nopassword':
      $('p#register-error').text(data.message);
    break;
    case 'nopassword2':
      $('p#register-error').text(data.message);
    break;
    case 'nomatch':
      $('p#register-error').text(data.message);
      $('input[name="password2"]').val('');
    break;
    case 'error':
      $('p#register-error').text('An unexpected error occurred!');
    break;
  }
}

function htmlLoginComplete(data) {
  switch(data.status){
    case 'ok':
      var url = '/';
      var redirect = getUrlVars()['redirect'];
      if(redirect) url = url + redirect;
      window.location = url;
    break;
    default:
      $('p#login-error').empty().append('Invalid Email or Password');
    break;
  }
}

function htmlUpdateEmailComplete(data) {
  switch(data.status){
    case 'ok':
       $('p#email-status').text(data.message);
       $('section.top-bar-section span.username').text(data.newEmail);
       $('form#account input[name="email"]').val('');
       $('form#account input[name="email2"]').val('');
    break;
    case 'invalid':
      $('p#email-status').text(data.message);
    break;
    case 'noemail2':
      $('p#email-status').text(data.message);
    break;
    case 'nomatch':
      $('p#email-status').text(data.message);
      $('form#account input[name="email2"]').val('').focus();
    break;
    case 'emailexists':
      $('p#email-status').text(data.message);
    break;
    case 'nochanges':
      $('p#email-status').text(data.message);
    break;
  }
}


function htmlUpdatePasswordComplete(data) {
  switch(data.status){
    case 'ok':
       $('p#password-status').text(data.message);
       $('form#account input[name="oldPassword"]').val('');
       $('form#account input[name="newPassword"]').val('');
       $('form#account input[name="newPassword2"]').val('');
    break;
    case 'nooldpassword':
      $('p#password-status').text(data.message);
      $('form#account input[name="oldPassword"]').focus();
    break;
    case 'badpassword':
      $('p#password-status').text(data.message);
      $('form#account input[name="oldPassword"]').val('').focus();
    break;
    case 'nopassword':
      $('p#password-status').text(data.message);
      $('form#account input[name="newPassword"]').focus();
    break;
    case 'nopassword2':
      $('p#password-status').text(data.message);
      $('form#account input[name="newPassword2"]').focus();
    break;
    case 'nomatch':
      $('p#account-status').text(data.message);
      $('form#account input[name="newPassword2"]').val('').focus();
    break;
  }
}

function htmlUpdateProfileInfoComplete(data) {

       $('p#profile-status').text('Profile Information Updated Successfully');

       // $('form#account input[name="email"]').val('');
       // $('form#account input[name="email2"]').val('');

}