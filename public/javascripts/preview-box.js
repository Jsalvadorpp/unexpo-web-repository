let id = $("#preview-box").attr('data-id');
let filename = $("#preview-box").attr('data-name');
let size = $("#preview-box").attr('data-size');
let caption = $("#preview-box").attr('data-caption');
let mimetype = $("#preview-box").attr('data-mimetype');

let previewType = getPreviewType(filename);
var url;
var setPreview;

if(previewType != false){

  url =  window.location.protocol + '//' + window.location.host;
  setPreview = true;
  url += (previewType == 'pdf')? `/files/download?id=${id}&status=false` : `/files/download?id=${id}`;
}else{

  url = "<h1 class='text-center' style='padding-top: 20%;'>No hay vista previa para este tipo de archivo</h1>";
  setPreview = false;
}

$("#preview-box").fileinput({
    language: 'es',
    theme: "fas",
    showClose: false,
    showBrowse: false,
    showRemove: false,
    showCaption: false,
    initialPreview: [  
      url
    ],
    initialPreviewAsData: setPreview,
    initialPreviewConfig: [
      {type: `${previewType}` ,filename: `${filename}`, caption: `${caption}` ,size: `${size}` , filetype: `${mimetype}`},
    ],
    preferIconicPreview: true, // this will force thumbnails to display icons for following file extensions
    previewFileIconSettings: { // configure your icon file extensions
      'doc': '<i class="fas fa-file-word text-primary"></i>',
      'xls': '<i class="fas fa-file-excel text-success"></i>',
      'ppt': '<i class="fas fa-file-powerpoint text-warning"></i>',
      'pdf': '<i class="fas fa-file-pdf text-danger"></i>',
      'zip': '<i class="fas fa-file-archive text-muted"></i>',
      'htm': '<i class="fas fa-file-code text-info"></i>',
      'txt': '<i class="fas fa-file-alt text-info"></i>',
      'mov': '<i class="fas fa-file-video text-warning"></i>',
      'mp3': '<i class="fas fa-file-audio text-warning"></i>',
      'jpg': '<i class="fas fa-file-image text-danger"></i>', 
      'gif': '<i class="fas fa-file-image text-muted"></i>', 
      'png': '<i class="fas fa-file-image text-primary"></i>'    
    },
    previewFileExtSettings: { // configure the logic for determining icon file extensions
      'doc': function(ext) {
        return ext.match(/(doc|docx)$/i);
      },
      'xls': function(ext) {
        return ext.match(/(xls|xlsx)$/i);
      },
      'ppt': function(ext) {
        return ext.match(/(ppt|pptx)$/i);
      },
      'zip': function(ext) {
        return ext.match(/(zip|rar|tar|gzip|gz|7z)$/i);
      },
      'htm': function(ext) {
        return ext.match(/(htm|html)$/i);
      },
      'txt': function(ext) {
        return ext.match(/(txt|ini|csv|java|php|js|css)$/i);
      },
      'mov': function(ext) {
        return ext.match(/(avi|mpg|mkv|mov|mp4|3gp|webm|wmv)$/i);
      },
      'mp3': function(ext) {
          return ext.match(/(mp3|wav)$/i);
      }
    }
});

function getPreviewType(filename){

    let ext = filename.split('.').pop();
   
    if(ext.match(/(doc|docx|xls|xlsx|ppt|pptx)$/i)) return 'office';
    if(ext.match(/(jpg|png|gif|jpeg)$/i)) return 'image';
    if(ext.match(/(avi|mpg|mkv|mov|mp4|3gp|webm|wmv)$/i)) return 'video';
    if(ext.match(/(pdf)$/i)) return 'pdf';
    if(ext.match(/(mp3|wav)$/i)) return 'audio';
    if(ext.match(/(txt)$/i)) return 'text';

    //= in case there's not match
    return false;
}