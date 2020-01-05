$(document).ready( () => {
    let mention = $('#selectOption-script').attr('data-mention');
    let semester = $('#selectOption-script').attr('data-semester');

    $(`#mention-options option[value=${mention}]`).attr('selected',true);
    $(`#semester-options option[value=${semester}]`).attr('selected',true);
});