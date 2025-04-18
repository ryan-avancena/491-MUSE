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
});
