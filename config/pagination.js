const limitPerPage = 5;

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
        var response = { message : 'data not found'};
        return res.status(404).json(response);
      }
      
    }else{

        var nextPage = page+1;
        var previousPage = page-1;
        const totalPages = Math.ceil(count/limitPerPage);

        if(page>totalPages) res.status(404).json({message : 'data not found'});
    
        if(page==1) previousPage = null;
        if(page==totalPages) nextPage = null; 
          
        let dataObtained = {
          files : docs,
          url: url,
          resultsTitle,
          currentPage: page,
          totalPages : totalPages,
          totalFiles: count,
          nextPage: nextPage,
          previousPage: previousPage,
          page: 'files'
        }
        
        if(ajaxStatus){
          let output = showFiles(dataObtained,setFilters);
          res.send(output);
        }else{
          res.render('files',dataObtained);
        }  
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
  output+=`<h3 class='text-center'>p&aacute;gina ${currentPage} de ${totalPages} </h3><hr>`;
  output+=`<table class='table-bordered' style="width:100%">`;
  
  files.forEach(file => {
    
    let btnClass = file.elementClass.btnClass;
    let btnName = file.elementClass.btnName;

    output+=` <tr>
    <td style="width:5%" class='d-none d-sm-table-cell' >
        <div class='text-center' >
            <a href="#" role="button" class='btn ${btnClass} d-block'>${btnName}</a>
        </div>
    </td>`;
    output+=` <td style="width: 85%">
    <h6 class='card-title font-weight-bold mb-0'>${file.title}</h6>
    <small class='card-subtitle text-muted'>Subido por: <a href="/user/files?id=${file.userId}">${file.createdBy}</a></small>`
    if(file.tags!= null && file.tags.length > 0){
      output+=`<div class='tags'>Tags:`;
      file.tags.forEach(tag => {
        output+=" ";
        output+=`<a href="/tags/files?tag=${tag}" class="badge badge-secondary">${tag}</a>`
        output+=" ";
      });
      output+=`</div>`;
    }

    output+=` <td style="width:10%" class='text-center'>
    <div class='text-center' >
        <a href="#" role="button" class='btn ${btnClass} d-block d-sm-none'>${btnName}</a>
    </div>`;

    output+=`<a href="/files/viewFile?id=${file.id}" role="button" class="btn btn-dark d-block" style='width: 110px; margin: auto;'>Ver archivo</a>
    </td></tr>`;
  
  });
  output+=`</table><hr>`;

  output+=`<ul class="pagination justify-content-center">`;
  var pageButtonStatus = (previousPage)? 'enabled' : 'disabled';

  output+=`<li class="page-item ${pageButtonStatus}">
    <button class="page-link pageBtn" data-page="&page=${previousPage}">Previous</button>
  </li>`;

  output+=` <li class="page-item">
    <button  class="page-link pageBtn" data-page="&page=${currentPage}">${currentPage}</button>
  </li>`;

  pageButtonStatus = (nextPage)? 'enabled' : 'disabled';
  output+=`<li class="page-item ${pageButtonStatus}">
    <button  class="page-link pageBtn" data-page="&page=${nextPage}">Next</button>
  </li>`;

  output+=`</ul></div>`;

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