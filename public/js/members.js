function populateMemberResults() {
    $.ajax({
        type: 'GET',
        url: '/people',
        dataType: 'json'
    }).done(function(data, textStatus, jqXHR) {
        $.each(data, function(i, member) {
            if (member.admin === true) {
                console.log(member);
                $card = $('#exec-card-template').clone(true);
                $card.removeAttr('id');
                
                $card.find('.card-title').html(member.forename + ' ' + member.surname);
                $card.find('.card-subtitle').html(member.role);

                var dataTarget = 'userStatsCollapse-' + i;
                $card.find('a').attr('data-target', "#" + dataTarget);
                $card.find('.collapse').attr('id', dataTarget);

                $('#execCards').append($card);
                $card.show();
            } else {

            }
        });
    }).fail(function(jqXHR, textStatus, err) {

    });
};