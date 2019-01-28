$('.add-btn').click(function() {
    $(this).fadeToggle('fast');
    $(this).next('.add-btn-group').fadeToggle('fast');
});

$('.add-btn-group > button').click(function() {
    $(this).parent().fadeToggle('fast');
    $(this).parent().prev('.add-btn').fadeToggle('fast');
});


$('.list-unstyled li').click(function() {
    $('.list-unstyled li.active').removeClass('active');
    $(this).addClass('active');
});


$('#workoutLink').click(function() {
    $('#content > .row').hide();
    $('#workouts').show();
    fetchExercises(populateExerciseList);
});

$('#exerciseLink').click(function() {
    $('#content > .row').hide();
    $('#exercises').show();
});

$('#memberLink').click(function() {
    $('#content > .row').hide();
    $('#members').show();
});

$('#statLink').click(function() {
    $('#content > .row').hide();
    $('#stats').show();
});

var itemToRemove;
var gridToRemoveFrom;

$(document).on('shown.bs.modal', '#removeBlockModal', function(event) {
    var triggerElement = event.relatedTarget;
    itemToRemove = triggerElement.parentNode.parentNode;
    console.log(itemToRemove);
    gridToRemoveFrom = columnGrids.filter(function (g) {
        return g.getItems(itemToRemove).length > 0;
    })[0];
    //- console.log(gridToRemoveFrom);
});

$('#confirmRemove').click(function() {
    if ($(itemToRemove).hasClass('muuri-item')) {
        gridToRemoveFrom.remove(itemToRemove);
        if ($(itemToRemove).hasClass('board-column')) {
            var gridToRemove = columnGrids.filter(function (g) {
                return itemToRemove.contains(g.getElement());
            })[0];
            var index = columnGrids.indexOf(gridToRemove);
            if (index > -1) { columnGrids.splice(index, 1); }
        }
    } else if ($(itemToRemove).hasClass('exercise-card')) {
        deleteExercise($(itemToRemove).attr('data-slug'));
    };

    $(itemToRemove).remove();
});