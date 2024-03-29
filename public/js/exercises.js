/**
 *
 * @param  {...any} cbs
 */
function fetchExercises(...cbs) {
  $.ajax({
    type: 'GET',
    url: '/exercise',
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
 * @param {*} slug
 * @param  {...any} cbs
 */
function fetchExerciseBySlug(slug, ...cbs) {
  $.ajax({
    type: 'GET',
    url: '/exercise/' + slug,
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
 * @param {*} slug
 */
function deleteExercise(slug) {
  $.ajax({
    type: 'DELETE',
    url: '/exercise/' + slug,
  }).done(function(data, textStatus, jqXHR) {
    fetchExercises(populateExerciseResults);
    $('#removeBlockModal').modal('hide');
  }).fail(function(jqXHR, textStatus, err) {
    $('#removeBlockModal .modal-body')
        .html('Cannot delete exercise: ' + jqXHR.responseText);
    $('#removeBlockModal .btn-danger').addClass('disabled');
    setTimeout(function() {
      $('#removeBlockModal').modal('hide');
    }, 3000);
    $('#removeBlockModal .btn-danger').removeClass('disabled');
    $('#removeBlockModal .modal-body')
        .html('Are you sure you want to remove this item?');
  });
};

/**
 *
 * @param {*} data
 * @param {*} textStatus
 * @param {*} jqXHR
 */
function populateExerciseResults(data, textStatus, jqXHR) {
  if (data.length === 0) {
    $('#noExercises').show();
  }
  $('#noExercises').nextAll().remove();

  $.each(data, function(i, item) {
    $exCard = $('#ex-card-template').clone(true);
    $exCard.removeAttr('id');
    $exCard.attr('data-slug', item.slug);
    $exCard.find('.card-title').html(item.name);
    $exCard.find('.card-text').html(item.description);

    setStarRating($exCard, item.difficulty);

    $('#exerciseResults').append($exCard);
    $exCard.show();
  });
};

/**
 *
 */
(function() {
  window.addEventListener('load', function() {
    const form = document.getElementById('addExerciseForm');

    if (form) {
      form.addEventListener('submit', function(event) {
        event.preventDefault();
        event.stopPropagation();

        if (form.checkValidity() !== false) {
          $.ajax({
            type: 'POST',
            url: form.getAttribute('action'),
            data: $(form).serialize(),
          }).done(function(data, textStatus, jqXHR) {
            $(form).children('.alert-danger').hide();
            $(form).children('.alert-success')
                .html('Exercise added!').show().delay(5000).fadeOut(200);
            $(form).find('input:text, textarea').val('');
            $(form).find('input:radio')
                .removeAttr('checked').removeAttr('selected');
            $(form).find('.rating span').removeClass('checked selected');
            $(form).find('.rating i').removeClass('fas').addClass('far');
            form.classList.remove('was-validated');
            fetchExercises(populateExerciseResults);
          }).fail(function(jqXHR, textStatus, err) {
            $(form).children('.alert-danger')
                .html(jqXHR.responseText).show().delay(5000).fadeOut(200);
          });
        } else {
          form.classList.add('was-validated');
          if (!$(form).find('input[name=exDifficulty]:checked').val()) {
            $(form).find('.rating .invalid-feedback').show();
          } else {
            $(form).find('.rating .invalid-feedback').hide();
          }
        }
      }, false);
    }
  }, false);
})();

fetchExercises(populateExerciseResults);
