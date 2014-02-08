$(document).ready(initialize);

function initialize(){
  $(document).foundation();
  $('#register').on('click', clickRegister);
  $('#login').on('click', clickLogin);
  $('#logout-button').on('click', clickLogout);
  $('#update-email').on('click', clickUpdateEmail);
  $('#update-password').on('click', clickUpdatePassword);
  $('#update-profile').on('click', clickUpdateProfile);
  $('#update-profilePic').on('click', clickUpdateProfilePic);
  $('#upload-to-s3').on('click', clickUploadToS3);
}

function clickUploadToS3(e){
  var url = '/upload';
  var data = {};
  var $file = $('form#s3uploader input[type="file"]')[0].files[0];
  var fileData = new FormData();
  var fileName = $file.name;
  var fileSize = $file.size;
  uploadSpinner();
  $('#spinner').css('display', 'block');
  $('#progress .error-text').css('display', 'none');

  data.filename = fileName;
  sendAjaxRequest(url, data, 'post', null, e, function(r){
    var key = "uploads/" + r.email + "/" + fileName
    url = 'http://mixstudio.s3.amazonaws.com';
    fileData.append('key', key);
    fileData.append('AWSAccessKeyId', r.key);
    fileData.append('policy', r.policy);
    fileData.append('signature', r.signature);
    fileData.append("file",$file);
    sendAjaxFiles(url, fileData, 'post', null, e, function(response){
      $('form#s3uploader')[0].reset();
      $('#progress .error-text').text('File uploaded successfully.');
      $('#progress .error-text').css('display', 'block');
      $('#spinner').css('display', 'none');
      $('#progress .percent').empty();
      $('#progress > .bar').css('width','0%');
      var zipFileData = {
        name: fileName,
        size: fileSize,
        createdBy: r.email
      };
      url = '/upload/create';
      sendAjaxRequest(url, zipFileData, 'post', null, e, function(res){
        if(res.status === 'error'){
          console.log('DB ERROR');
        } else {
          console.log('DB RECORD CREATED');
        }
      });
    },
    function(data){
      if (data.lengthComputable) {
        var percent = Math.round((data.loaded / data.total) * 10000) / 100;
        $('#progress .percent').text(percent.toFixed(2) + '%');
        $('#progress .bar').css('width', percent + '%');
      }
    });
  });
}

function uploadSpinner() {
  var opts = {
    lines: 9, // The number of lines to draw
    length: 3, // The length of each line
    width: 2, // The line thickness
    radius: 5, // The radius of the inner circle
    corners: 1, // Corner roundness (0..1)
    rotate: 0, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: '#000', // #rgb or #rrggbb or array of colors
    speed: 1.8, // Rounds per second
    trail: 60, // Afterglow percentage
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: 'auto', // Top position relative to parent in px
    left: 'auto' // Left position relative to parent in px
  };
  var target = document.getElementById('spinner');
  var spinner = new Spinner(opts).spin(target);
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