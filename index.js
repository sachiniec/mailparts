
var mimelib = require('mimelib');

exports.breakMail = function(boundary , bdy){

	var level_1 = bdy.split('--'+boundary);
	var parts = [];

	if(level_1[0] != undefined){
		level_1.forEach(function(val, index){
				var r = exports.getChildParts(val);
				if((r.bdy != '' || r.child) && r.head != ''){
				parts.push(r);
			}
		});
	}

	return parts;
};

exports.isAttachment = function(header){

  var p = mimelib.parseHeaders(header);

  var ct  = p['content-type'] != undefined ?  p['content-type'].toString() : "" ;
  var cd  = p['content-disposition'] != undefined ? p['content-disposition'].toString() : "";

  var textContent =  ct.indexOf("text/plain") != -1 || ct.indexOf("text/html") != -1;
  var attachDisposition =  cd.indexOf("attachment") != -1 || cd.indexOf("inline") != -1;
  var notMultipart = ct.indexOf("multipart/") == -1;

  // detect if this is an attachment or a text node (some agents use inline dispositions for text)
  if(textContent && ( cd == "" || cd.indexOf("inline") != -1 )){
      return false;
  }else if((!textContent || attachDisposition) && notMultipart){
      return true;
  }
}

exports.getAttachments = function(boundary , bdy){

  var level_1 = bdy.split('--'+boundary);
  var attachments = [];

  if(level_1[0] != undefined){
    level_1.forEach(function(val, index){
        var r = exports.getChildParts(val);
        if((r.bdy != '' || r.child) && r.head != ''){
          if(exports.isAttachment(r.head)){
            var bdyyy = new Buffer(r.bdy, "base64");
            attachments.push({'size' : bdyyy.length });
          }
        }
    });
  }

  return attachments;
};

exports.getChildParts = function(val){
  
  val = val.replace(/[\r\n]+$/, ""); // updated regex
  var is_html = false;
  
  var match1  = val.match(/(\r?\n){2}/);
  var _tmp_head  = '', _tmp_bdy = '';
  var that2 = this;

  _tmp_head  = match1 && val.substr(0, match1.index) || "";
  _tmp_bdy   = match1 && val.substr(match1.index + match1[0].length) || '';  
  
  var parsed = mimelib.parseHeaders(_tmp_head);
  var ct = parsed["content-type"] != undefined ? parsed["content-type"].toString() : "" ;
  var cte = parsed["content-transfer-encoding"] != undefined ? parsed["content-transfer-encoding"].toString() : "" ; 

  var b = this.getBoundary(ct);
  
  var child = [];

  if(b){

    var level_2 = _tmp_bdy.split('--'+b);

    if(level_2[0] != undefined){
      level_2.forEach(function(val1, index){
        var d  = that2.getChildParts(val1);
        
        if((d.bdy != '' || d.child) && d.head != ''){
          child.push(d);
        } 
      });
    }
  }

  if(_tmp_head != "" ){
    _tmp_head = _tmp_head.replace(/\r?\n|\r/g, "\n")
                             .replace(/\n*$/, "\n")
                             .replace(/\n/g, "\r\n")
                             .replace(/^(\r\n)/, "")
  }
                             
  if(child[0] != undefined){
    return {head:_tmp_head , bdy: '' , bndry: b, child : child};
  }else{
    return {head:_tmp_head , bdy: _tmp_bdy , bndry: b};
  }
}  

exports.getBoundary = function (ct) {
      var match = ct.match(/boundary\s*=\s*["']?([^"';]+)["']?/i);
      var boundary = match != null ? (match[1] || '') : '';
      boundary = boundary.replace(/"/g, "").replace("\n", "");
      return boundary;
};

exports.reFormMail = function(parts, boundary){

  var html = '';
  
  for(var index  = 0 ;index < parts.length ; index++){
    
    var val = parts[index];
    if(val.child != undefined){
      html += '--'+boundary+'\r\n'; // Glue for parts
      html += val.head+'\r\n';
      html += this.reFormMail(val.child, val.bndry);   
      html += '\r\n';
    }else{

      html += '\r\n--'+boundary+'\r\n'; // Glue for parts
      if(val.head != "" && val.bdy != ""){       

        html += val.head+'\r\n'+val.bdy;
        html += '\r\n';
      }
    }
  }
  return html+'\r\n--'+boundary+'--';
}


