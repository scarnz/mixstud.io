$(document).ready(initialize);

var socket;
var name;
var player;
var color;

function initialize(){
  $(document).foundation();
  initializeSocketIO();
  $('#register').on('click', clickRegister);
  $('#login').on('click', clickLogin);
  $('#logout-button').on('click', clickLogout);
  $('#savefiles').on('click', clickSaveFiles);
  $('#add-image').on('click', clickAddImage);
  $('#update-email').on('click', clickUpdateEmail);
  $('#update-password').on('click', clickUpdatePassword);
  $('#update-profile').on('click', clickUpdateProfile);
  $('#update-profilePic').on('click', clickUpdateProfilePic);
  $('a.update-post').on('click', clickUpdatePost);
  $('a.create-post').on('click', clickCreatePost);
  $('body').find('a.delete-image').on('click', clickDeleteFile);
  $('body').find('a.delete-post').on('click', clickDeletePost);
  $('body').find('a.delete-user').on('click', clickDeleteUser);
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

function clickSaveFiles(e){
  // if($('input[name="file1"]').val() !== ''){

    var url = '/upload';
    var data = new FormData();
    var file, fileName, fileType, isImage;
    $('#file-upload input[type="file"]').each(function(i){
      if(this.files[0]){
        fileType = this.files[0].type;
        isImage = validateImageFileType(fileType);
        if(isImage){
          file = this.files[0];
          fileName = $(this).attr('name');
          data.append(fileName,file);
        }
      }
    });
    if(!isImage){
      return $('#upload-error').text('All files must be images (.jpg, .png, .gif)');
    } else {
      data.append('postId', $('#postId').val());
      sendAjaxFiles(url, data, 'post', null, e, function(result){
        window.location = '/upload';
      });
    }

  // }

}

function clickAddImage(e){
  var totalInputs = $('#new-post input[type="file"]').length;
  var fileNum = totalInputs +1;
  $newInput = $('<div class="row"><div class="small-12 columns"><input id="file'+fileNum+'" type="file" name="file'+fileNum+'" /></div></div>');
  $newInput.insertBefore($('#new-post div.row.add-image'));
}

function clickCreatePost(e){
  var url = '/admin/posts';
  var data = {};
  var file, fileName, fileType, isImage;
  var fileData = new FormData();

  data.postTitle = $('#new-post input[name="title"]').val();
  data.postContent = $('#new-post textarea[name="content"]').val();
  sendAjaxRequest(url, data, 'post', null, e, function(result){
    switch(result.status){
      case 'ok':
      if($('#new-post input#file1').val()){
        url = '/admin/files';
        $('#new-post input[type="file"]').each(function(i){
          if(this.files[0]){
            fileType = this.files[0].type;
            isImage = validateImageFileType(fileType);
            if(isImage){
              file = this.files[0];
              fileName = $(this).attr('name');
              fileData.append(fileName,file);
            }
          }
        });
        if(!isImage){
          return $('#post-error').text('All files must be images (.jpg, .png, .gif)');
        } else {
          fileData.append('postId', result.newPostId);
          sendAjaxFiles(url, fileData, 'post', null, e, function(r){
            window.location = '/admin/posts';
          });
        }
      } else {
        window.location = '/admin/posts';
      }
      break;
      case 'error':
        $('#post-error').text('You must at least enter a title for your post!');
      break;
    }
    console.log(result);
  });
}

function clickUpdatePost(e){
  var postId = $(this).data('post-id');
  var url = '/admin/posts/'+postId;
  var data = {};
  var file, fileName, fileType, isImage;
  var fileData = new FormData();

  data.postTitle = $('#new-post input[name="title"]').val();
  data.postContent = $('#new-post textarea[name="content"]').val();
  sendAjaxRequest(url, data, 'post', 'put', e, function(result){
    switch(result.status){
      case 'ok':
      if($('#new-post input#file1').val()){
        url = '/admin/files';
        $('#new-post input[type="file"]').each(function(i){
          if(this.files[0]){
            fileType = this.files[0].type;
            isImage = validateImageFileType(fileType);
            if(isImage){
              file = this.files[0];
              fileName = $(this).attr('name');
              fileData.append(fileName,file);
            }
          }
        });
        if(!isImage){
          return $('#post-error').text('All files must be images (.jpg, .png, .gif)');
        } else {
          fileData.append('postId', result.postId);
          sendAjaxFiles(url, fileData, 'post', null, e, function(r){
            window.location = '/admin/posts';
          });
        }
      } else {
        window.location = '/admin/posts';
      }
      break;
      case 'error':
        $('#post-error').text('You must at least enter a title for your post!');
      break;
    }
    console.log(result);
  });
}

function clickDeleteFile(e){
  var url = '/admin/files';
  var data = {};
  var $deleteButton = $(this);
  data.fileId = $(this).data('file-id');
  sendAjaxRequest(url, data, 'post', 'delete', e, function(data){
    switch(data.status){
      case 'ok':
        $deleteButton.closest('.image-container').remove();
      break;
      default:
        $('p#delete-error').text(data.status);
      break;
    }
  });
}

function clickDeletePost(e){
  var url = '/admin/posts';
  var data = {};
  var $deleteButton = $(this);
  data.postId = $(this).data('post-id');
  sendAjaxRequest(url, data, 'post', 'delete', e, function(data){
    switch(data.status){
      case 'ok':
        $deleteButton.parent().parent().remove();
      break;
      case 'error':
        $('p#delete-error').text('There was an error deleting the post');
      break;
    }
  });
}

function clickDeleteUser(e){
  var url = '/admin/users';
  var data = {};
  var $deleteButton = $(this);
  data.userId = $(this).data('user-id');
  sendAjaxRequest(url, data, 'post', 'delete', e, function(data){
    switch(data.status){
      case 'ok':
        $deleteButton.parent().parent().remove();
      break;
      case 'error':
        $('p#delete-error').text('There was an error deleting the user');
      break;
    }
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

function initializeSocketIO(){
  var port = location.port ? location.port : '80';
  var url = location.protocol + '//' + location.hostname + ':' + port + '/app';

  socket = io.connect(url);
  socket.on('connected', socketConnected);
}

function socketConnected(data){
  console.log(data);
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