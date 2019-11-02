$(document).ready( () => {
    let category = $('#selectOption-script').attr('data-category');
    $(`select option[value=${category}]`).attr('selected',true);
});