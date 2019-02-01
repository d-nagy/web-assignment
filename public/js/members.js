function fetchMembers() {
    var args = Array.from(arguments);
    $.ajax({
        type: 'GET',
        url: '/people',
        dataType: 'json'
    }).done(function(data, textStatus, jqXHR) {
        args.forEach(function(cb) {
            cb.call(this, data, textStatus, jqXHR);
        });
    }).fail(function(jqXHR, textStatus, err) {
        
    });
};
// 
function populateProfileStats() {
    $.ajax({
        type: 'GET',
        url: '/people/self/get',
        dataType: 'json'
    }).done(function(data, textStatus, jqXHR) {
        $('#totalCompleted').append(data.wk_completed);
        $('#dailyCompleted').append(data.daily_completed);
    }).fail(function(jqXHR, textStatus, err) {
        
    });
};

function populateMemberResults(data, textStatus, jqXHR) {
    $('#execCards').html('');
    $('#userTable').html('');

    $.each(data, function(i, member) {
        var name = member.forename + ' ' + member.surname;
        var wk_completed = member.wk_completed;
        var daily = member.daily_completed;
        if (member.admin === true) {
            $card = $('#exec-card-template').clone(true);
            $card.removeAttr('id');
            
            $card.find('.card-title').html(name);
            $card.find('.card-subtitle').html(member.role);

            $card.find('.wkComplete').html(wk_completed);
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
            $tdCompleted.html(wk_completed);
            
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

$('.modifyUserModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget);
    var username = button.data('id');
    var modal = $(this);

    if (modal.attr('id') === 'promoteUserModal') {
        modal.find('#promoteUserUsername').val(username);
    } else if (modal.attr('id') === 'demoteUserModal') {
        modal.find('#demoteUserUsername').val(username);
    }
});

$('#promoteUserModal').on('hide.bs.modal', function (event) {
    var modal = $(this);
    modal.find('#userRoleInput').removeClass('is-invalid').val('');
    modal.find('#promoteUserUsername').val('');
});

$('#promoteUserSubmit').click(function(event) {
    var modal = $('#promoteUserModal');

    $roleInput = modal.find('#userRoleInput');
    
    if ($roleInput.val() === '') {
        $roleInput.addClass('is-invalid');
    } else {
        var username = modal.find('#promoteUserUsername').val();
        $.ajax({
            type: 'PUT',
            url: '/people/promote',
            data: {
                username: username,
                role: $roleInput.val()
            }
        }).done(function(data, textStatus, jqXHR) {
            modal.modal('hide');
            populateMemberResults();
        }).fail(function(jqXHR, textStatus, err) {

        });
    }
});

$('#demoteUserSubmit').click(function(event) {
    var modal = $('#demoteUserModal');
    var username = modal.find('#demoteUserUsername').val();

    console.log(username);
    
    $.ajax({
        type: 'PUT',
        url: '/people/demote',
        data: {
            username: username
        }
    }).done(function(data, textStatus, jqXHR) {
        modal.modal('hide');
        populateMemberResults();
    }).fail(function(jqXHR, textStatus, err) {
         
    });
});

fetchMembers(populateMemberResults);