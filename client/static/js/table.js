$(document).ready(function () {
    $('#tracksTable').DataTable({
        language: {
            search: "",
            lengthMenu: ""
        },
    });

    $('#tracksTable tbody').on('click', 'tr', function () {
        songId = $(this).data('id');
        console.log('Song ID:', songId);
    });

    $('#tracksTable_filter input').attr('placeholder', 'Search for songs...');

    // Optionally, you can style the input field to customize its appearance
    $('#tracksTable_filter input').css({
        'background-color': 'white',
        'color': 'black',
        'border': '1px solid #555',
        'padding': '5px 10px',
        'border-radius': '5px',
        'margin-bottom': '1rem'
    });
});
