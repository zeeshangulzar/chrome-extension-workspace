// this file controls the popup:

$(document).ready(function () {

  // fill in title and company from the DOM
  chrome.runtime.sendMessage({method:'getTitle'}, function(response){
    $('#title').val(response[0]);
    $('#company').val(response[1])
  });


  // fill in the url with current url
  chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
    var tab = tabs[0];
    $('#url').val(tab.url);
  });



  // if the user is logged in, hide login form and show job form
  if (localStorage.length > 0) {
    $('#showSignIn').addClass('invisible');
    $('#jobForm').removeClass('invisible');
    $.ajax({
      method: "GET",
      url: "http://localhost:3000/get_experties?email=" + localStorage.email,
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Authorization", localStorage.authorization);
      },
      success: function(data, status, xhr) {
        if (data["expertise_ids"].length !== 0) {
          localStorage.setItem('experties_ids', data["expertise_ids"]);
            var html = ''
            var ids = localStorage.experties_ids.split(',')
            var groups = [], i;
            for (i = 0; i < ids.length; i += 2) {
                groups.push(ids.slice(i, i + 2));
            }

            $.each( groups, function( key, value ) {
              html = html + "<input type='checkbox' name='experties_" + key + "' value='" + value[1] + "'>" + value[0] + "<br>"
            });
            $("#experties_list").html(html);
          }
        },
    });
    event.stopPropagation();
  }



  // submit the sign in form
  $('#login').click(function(event) {
    event.preventDefault();
    var email = $('#email').val();
    var password = $('#password').val();

    $.ajax({
      method: "POST",
      url: "http://localhost:3000/v1/sign_in?password=" + password + "&email=" + email,
      dataType: "json",
      success: function(data, status, xhr) {
        localStorage.setItem('experties_ids', data["expertise_ids"]);
        localStorage.setItem('email', data["email"]);
        localStorage.setItem('authorization', data["authentication_token"]);

        $('#showSignIn').fadeOut('slow', function() {
          $('#showSignIn').addClass('invisible');
          $('#jobForm').fadeIn('medium');
          $('#jobForm').removeClass('invisible');
          $('#email').val("");
          $('#password').val("");
          if (data["expertise_ids"].length !== 0) {
            var html = ''
            var ids = localStorage.experties_ids.split(',')
            var groups = [], i;
            for (i = 0; i < ids.length; i += 2) {
              groups.push(ids.slice(i, i + 2));
            }
            $.each( groups, function( key, value ) {
              html = html + "<input type='checkbox' name='experties_" + key + "' value='" + value[1] + "'>" + value[0] + "<br>"
            });
            $("#experties_list").html(html);
          }
        });
      },
      error: function(data) {
        $('.error').fadeIn(300).delay(1500).fadeOut(400);
      }
    });
    event.stopPropagation();
  });



  // submit the job form
  $('#createJob').click(function(event) {
    var experties = new Array();
    $.each( $("#experties_list input"), function( key, checkbox ) {
      if (checkbox.checked) {
        experties.push(checkbox.value);
      }
    });
    event.preventDefault();
    job_data = {professor: { name: $('#title').val(), expertise_ids: experties }, email: localStorage.email };

    $.ajax({
      method: "POST",
      url: "http://localhost:3000/create_professor",
      data: job_data,
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Authorization", localStorage.authorization);
      },
      success: function() {
        $('.success').fadeIn(300).delay(1500).fadeOut(400);
        $('#title').val("");
        $('#company').val("");
        $('#notes').val("");
      },
      error: function(data) {
        $('.failure').fadeIn(300).delay(1500).fadeOut(400);
      }
    });
    event.stopPropagation();
  });



  // log out: hide job form and show sign in form
  $('#logout').click(function(event) {
    event.preventDefault();
    localStorage.clear();
    $('#jobForm').fadeOut('slow', function() {
      $('#jobForm').addClass('invisible');
      $('#showSignIn').fadeIn('medium');
      $('#showSignIn').removeClass('invisible')
    });
  });



});
