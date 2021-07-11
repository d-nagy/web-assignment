/**
 *
 * @param  {...any} cbs
 */
function fetchMembers(...cbs) {
  $.ajax({
    type: 'GET',
    url: '/people',
    dataType: 'json',
  }).done(function(data, textStatus, jqXHR) {
    cbs.forEach(function(cb) {
      cb.call(this, data, textStatus, jqXHR);
    });
  }).fail(function(jqXHR, textStatus, err) {
    // pass
  });
};

/**
 *
 */
function populateProfileStats() {
  $.ajax({
    type: 'GET',
    url: '/people/self/get',
    dataType: 'json',
  }).done(function(data, textStatus, jqXHR) {
    $('#totalCompleted span').html(data.wk_completed);
    $('#dailyCompleted span').html(data.daily_completed);
  }).fail(function(jqXHR, textStatus, err) {
    // pass
  });
};

/**
 *
 * @param {*} data
 * @param {*} textStatus
 * @param {*} jqXHR
 */
function populateMemberResults(data, textStatus, jqXHR) {
  $('#execCards').html('');
  $('#userTable').html('');

  $.each(data, function(i, member) {
    const name = member.forename + ' ' + member.surname;
    const wkCompleted = member.wk_completed;
    const daily = member.daily_completed;
    if (member.admin === true) {
      $card = $('#exec-card-template').clone(true);
      $card.removeAttr('id');

      $card.find('.card-title').html(name);
      $card.find('.card-subtitle').html(member.role);

      $card.find('.wkComplete').html(wkCompleted);
      $card.find('.dailyStreak').html(daily);
      $card.find('.wkCreated').html(member.wk_created);

      if (member.level > 1) {
        $card.find('.card-footer').remove();
      }

      $card.find('.demoteButton').attr('data-id', member.username);

      $('#execCards').append($card);
      $card.show();
    } else {
      $tr = $(document.createElement('tr'));

      $tdName = $(document.createElement('td'));
      $tdName.html(name);

      $tdCompleted = $(document.createElement('td'));
      $tdCompleted.html(wkCompleted);

      $tdDaily = $(document.createElement('td'));
      $tdDaily.html(daily);

      $tr.append($tdName);
      $tr.append($tdCompleted);
      $tr.append($tdDaily);

      $promote = $(document.createElement('button'));
      $promote.addClass('btn btn-primary');
      $promote.html('Promote');
      $promote.attr('data-id', member.username);
      $promote.attr('data-toggle', 'modal');
      $promote.attr('data-target', '#promoteUserModal');

      $tdPromote = $(document.createElement('td'));
      $tdPromote.append($promote);
      $tr.append($tdPromote);

      $('#userTable').append($tr);
    }
  });
};

$('.modifyUserModal').on('show.bs.modal', function(event) {
  const button = $(event.relatedTarget);
  const username = button.data('id');
  const modal = $(this);

  if (modal.attr('id') === 'promoteUserModal') {
    modal.find('#promoteUserUsername').val(username);
  } else if (modal.attr('id') === 'demoteUserModal') {
    modal.find('#demoteUserUsername').val(username);
  }
});

$('#promoteUserModal').on('hide.bs.modal', function(event) {
  const modal = $(this);
  modal.find('#userRoleInput').removeClass('is-invalid').val('');
  modal.find('#promoteUserUsername').val('');
});

$('#promoteUserSubmit').click(function(event) {
  const modal = $('#promoteUserModal');

  $roleInput = modal.find('#userRoleInput');

  if ($roleInput.val() === '') {
    $roleInput.addClass('is-invalid');
  } else {
    const username = modal.find('#promoteUserUsername').val();
    $.ajax({
      type: 'PUT',
      url: '/people/promote',
      data: {
        username: username,
        role: $roleInput.val(),
      },
    }).done(function(data, textStatus, jqXHR) {
      modal.modal('hide');
      fetchMembers(populateMemberResults);
    }).fail(function(jqXHR, textStatus, err) {
      // pass
    });
  }
});

$('#demoteUserSubmit').click(function(event) {
  const modal = $('#demoteUserModal');
  const username = modal.find('#demoteUserUsername').val();

  $.ajax({
    type: 'PUT',
    url: '/people/demote',
    data: {
      username: username,
    },
  }).done(function(data, textStatus, jqXHR) {
    modal.modal('hide');
    fetchMembers(populateMemberResults);
  }).fail(function(jqXHR, textStatus, err) {
    // pass
  });
});

fetchMembers(populateMemberResults);
