function setUpForm(formUrl) {
  var form = FormApp.openByUrl(formUrl);
   
  ScriptApp.newTrigger('onFormSubmit').forForm(form).onFormSubmit().create();
}

function onFormSubmit(e) {
  var formResponse = e.response;
  var itemResponses = formResponse.getItemResponses();

  var formId = e.source.getId();

  var responses = {};
  for (var j = 0; j < itemResponses.length; j++) {
    var itemResponse = itemResponses[j];
    responses[itemResponse.getItem().getTitle()] = itemResponse.getResponse();
  }

  var options = {
    'method' : 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify([formId, responses])
  };

  UrlFetchApp.fetch('https://b7811892fb50.ngrok.io/response', options);
}