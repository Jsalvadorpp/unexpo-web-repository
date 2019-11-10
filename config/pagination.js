const limitPerPage = 5;

function pagination(req,res,searchData){

  const count = searchData.count;
  const page = searchData.page;
  const docs = searchData.docs;
  const url = searchData.url
  const resultsTitle = searchData.resultsTitle;
      
    if(searchData.err){
      return console.log(err); 

    }else if(count == 0){

      var response = { message : 'data not found'};
      return res.status(404).json(response);

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

        res.render('files',dataObtained);
      }
}

module.exports.pagination = pagination;
module.exports.limitPerPage = limitPerPage;