const limitPerPage = 40;
var filters = require('../models/filters');

function pagination(req,res,searchData,ajaxStatus,setFilters){

  const count = searchData.count;
  const page = searchData.page;
  const docs = searchData.docs;
  const url = searchData.url
  const resultsTitle = searchData.resultsTitle;

    if(searchData.err){
      return console.log(err); 

    }else if(count == 0){

      if(ajaxStatus){
        let response = `<br><div style='height: 300px;' class='text-center'><h2>No hay resultados</h2></div>`;
        res.send(response);

      }else{
        res.render('data-notFound', {page: 'Información no disponible'});
      }
      
    }else{

        var nextPage = page+1;
        var previousPage = page-1;
        const totalPages = Math.ceil(count/limitPerPage);

        if(page>totalPages) res.render('data-notFound', {page: 'Información no disponible'});
    
        if(page==1) previousPage = null;
        if(page==totalPages) nextPage = null; 
          
        filters.find({}).exec( (errs, filterList)=>{
          let dataObtained = {
            files : docs,
            url: url,
            resultsTitle,
            currentPage: page,
            totalPages : totalPages,
            totalFiles: count,
            nextPage: nextPage,
            previousPage: previousPage,
            page: 'Biblioteca de archivos',
            filterList
          }
          
          if(ajaxStatus){
            let output = showFiles(dataObtained,setFilters);
            res.send(output);
          }else{
            res.render('filesAdmin',dataObtained);
          }  
        });
      }
}

function showFiles(data,setFilters){

  let files = data.files;
  let url = data.url;
  let currentPage = data.currentPage;
  let totalPages = data.totalPages;
  let totalFiles = data.totalFiles;
  let nextPage = data.nextPage;
  let previousPage = data.previousPage;
  let resultsTitle = data.resultsTitle;

  let output = '';
  output+=`<div class='container-fluid text-center my-2' id='files-title'>`;
  output+=` <h2>${resultsTitle}</h2></div><hr>`;
  output+=`<h3 class='text-center'>P&aacute;gina ${currentPage} de ${totalPages} </h3><hr>`;
  output+=`<table class='table-bordered' style="width:100%">`;
  output+=`<tr style="color: white;">
    <td style="background-color: #020202eb" width='30%'>Título</td>
    <td style="background-color: #020202eb" width='15%'>Autor original</td>
    <td style="background-color: #020202eb" width='15%'>Ultima actualización</td>
    <td style="background-color: #020202eb" width='15%'>Fecha del material</td>
    <td style="background-color: #020202eb" width='15%'>Publicado por</td>
    <td style="background-color: #020202eb" width='5%'>Extensión</td>
    <td colspan="3" style="background-color: #020202eb" width='5%'></td>
    </tr>`;
  
  files.forEach(file => {
    
    output+=`<tr>`;
   
    output+=` <td>
    <p class='card-title font-weight-bold mb-0'>${file.title}</p>
    </td>`
    output+=` <td>
    <p class='card-title font-weight-bold mb-0'>${file.author}</p>
    </td>`;

    var date = '';
    const options = {
        year:"numeric",
        month:"2-digit",
        day:"2-digit"
    }
    date = file.uploadDate.toLocaleDateString('en-US',options);

    output+=` <td>
    <p class='card-title font-weight-bold mb-0'>${date}</p>
    </td>`;

    output+=`<td>
    <p class='card-title font-weight-bold mb-0'>${file.publicationDate}</p>
    </td>`;

    output+=`<td>
    <p class='card-title font-weight-bold mb-0'>${file.createdBy}</p>
    </td>`;

    output+=`<td>
    <p class='card-title font-weight-bold mb-0'>${file.filename.split('.').pop()}</p>
    </td>`;

    output+=`<td class='text-center'>
    <a  href="/files/viewFile?id=${file.id}" class="btn btn-dark d-block" style=' margin: auto;'>ver</a>
    </td>`;

    output+=`<td class='text-center'>
    <a  href="/files/edit?id=${file.id}" class="btn btn-success d-block" style=' margin: auto;'>editar</a>
    </td>`;

    output+=`<td class='text-center'>
    <form method="POST" action='/files/delete?id=${file.id}&_method=DELETE' onsubmit="return confirm('Estas seguro que deseas eliminar este archivo?');">
        <button type='submit' class="btn btn-danger d-block" style='width: 100%; margin: auto;'>Borrar</button>
    </form>
    </td>`;

    output+='</tr>';
  
  });
  output+=`</table><hr>`;

  output+=`<ul class="pagination justify-content-center">`;
  var pageButtonStatus = (previousPage)? 'enabled' : 'disabled';

  output+=`<li class="page-item ${pageButtonStatus}">
    <button class="page-link pageBtn" data-page="&page=${previousPage}">Anterior</button>
  </li>`;

  output+=` <li class="page-item">
    <button  class="page-link pageBtn" data-page="&page=${currentPage}">${currentPage}</button>
  </li>`;

  pageButtonStatus = (nextPage)? 'enabled' : 'disabled';
  output+=`<li class="page-item ${pageButtonStatus}">
    <button  class="page-link pageBtn" data-page="&page=${nextPage}">Siguiente</button>
  </li>`;

  output+=`</ul></div>`;

  output+=`<style>
    .table-bordered .btn{
        padding: 0px 6px;
    }
    #filesResult td{
        padding: 3px 6px;
    }
    </style>`;

  let ajaxData;
  ajaxData = (setFilters === false)? `$('#search').serialize()+page` : `$('#filtersForm').serialize()+page`;

  output+=`<script>
  $('.pageBtn').on('click', (e)=>{
    let page = e.target.dataset.page;
  
    $.ajax({
      type: 'POST',
      url: '${url}',
      data: ${ajaxData}
    }).done( (data)=>{
        $('html, body').animate({ scrollTop: 0 }, '100');
        $('#filesResult').html(data);
    });
  });
  </script>`

  return output;
}

module.exports.pagination = pagination;
module.exports.limitPerPage = limitPerPage;