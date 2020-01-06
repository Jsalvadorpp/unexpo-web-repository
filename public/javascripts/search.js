$('#search').keyup( () => {
    var query = $('#search').val();

    if(query != ''){
        $.ajax({
            type: "POST",
            url: '/files/search',
            data: {q : query}
        }).done ((output) => {
            
            $('#filesResult').html(output);
            $('#search-box').css('min-height','0');
        }); 
    }else{
        $('#filesResult').html('');
        $('#search-box').css('min-height','400px');
    }
});