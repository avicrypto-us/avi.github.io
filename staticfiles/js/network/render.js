"use strict";

//Steps:
//1. Implement /network/init/user_id that returns traverse_tree(user) response
//2. On expanding any node, AJAX fires off GET '/network/children/58'
//   Implement this api on the backend return the value of 'children' key like
//{'children': children} and the tree will automagically render the child nodes here

// clicking a node with id=58 automatically calls GET:'/network/children/58'

$(function() {
  var loaded = false
  var nodeTemplate = function(data) {
    if(data.id) {
      return `
        <span>${data.avi_id}</span>
        <div class="title">${data.name}</div>
        <div class="content">
        <p class="m-0">Package: ${data.package}</p>
        <p class="m-0">Invest: ${data.investment}</p>
        <p class="m-0">Trans.: ${data.transaction}</p>
        </div>
      `;
    } else {
      return ` 
      <div class="title">${data.name}</div>
    `;
    }
  };  
  
  var businessDetailsTemplate = function(data,dataClass){
    var business = '<div id=business_'+(dataClass=="root"?"root":data.avi_id)+'>'+
      '<br>'+
      '<h4 class="card-title">Business Detail: '+data.name+'('+data.avi_id+')</h4>'+
      '<div class="col-xl-4 col-sm-12 border-right-blue-grey border-right-lighten-5">'+
          '<div class="media px-1">'+
              '<div class="media-left media-middle">'+
                  '<i class="icon-box font-large-1 blue-grey"></i>'+
              '</div>'+
              '<div class="media-body text-xs-center">'+
                  '<span class="font-large-2 text-bold-300 info">Left</span>'+
              '</div>'+
              '<div class="row mt-1">'+
                  '<div>'+
                      '<table class="table aling-center">'+
                         '<tbody>'+
                             '<tr>'+
                                 '<td>Direct: </td>'+
                                 '<td>$'+(data.left_direct||0.0)+'</td>'+
                             '</tr>'+
                             '<tr>'+
                                 '<td>Binary: </td>'+
                                 '<td>$'+(data.left_binary||0.0)+'</td>'+
                             '</tr>'+
                         '</tbody> '+
                      '</table>'+
                  '</div>'+
              '</div>'+
          '</div>'+
      '</div>'+
      '<div class="col-xl-4 col-sm-12 border-right-blue-grey border-right-lighten-5">'+
          '<div class="media px-1">'+
              '<div class="media-left media-middle">'+
                  '<i class="icon-tag3 font-large-1 blue-grey"></i>'+
              '</div>'+
              '<div class="media-body text-xs-center">'+
                  '<span class="font-large-2 text-bold-200 deep-orange">Right</span>'+
              '</div>'+
              '<div class="row mt-1">'+
                  '<div>'+
                      '<table class="table aling-center">'+
                         '<tbody>'+
                             '<tr>'+
                                 '<td>Direct: </td>'+
                                 '<td>$'+(data.right_direct||0.0)+'</td>'+
                             '</tr>'+
                             '<tr>'+
                                 '<td>Binary: </td>'+
                                 '<td>$'+(data.right_binary||0.0)+'</td>'+
                             '</tr>'+
                         '</tbody> '+
                      '</table>'+
                  '</div>'+
              '</div>'+
          '</div>'+
      '</div>'+
      '<div class="col-xl-4 col-sm-12 border-right-blue-grey border-right-lighten-5">'+
          '<div class="media px-1">'+
              '<div class="media-left media-middle">'+
                  '<i class="icon-tag3 font-large-1 blue-grey"></i>'+
              '</div>'+
              '<div class="media-body text-xs-center">'+
                  '<span class="font-large-2 text-bold-200 deep-orange">Binary</span>'+
              '</div>'+
              '<div class="row mt-1">'+
                  '<div>'+
                      '<table class="table aling-center">'+
                        '<tbody>'+
                             '<tr>'+
                                 '<td>$'+(data.binary||0.0)+'</td>'+
                             '</tr>'+
                         '</tbody> '+
                      '</table>'+
                  '</div>'+
              '</div>'+
          '</div>'+
      '</div>'+
    '</div>';
    return business;
  } 

  let ajaxURL = {
      children: "/network/children/",
      parent: "/network/parent/",
      siblings: node => {
        return `/network/siblings/${node.id}`;
      },
      families: node => {
        return `/network/families/${node.id}`;
      }
    },

    initOrgchart = function(nodeId, chartClass) {
      var url="";
      if(loaded == true) {
        url = '/network/children/'+nodeId;
      } else {
        url = '/network/init';
        loaded=true;      
      }
        $('#chart-container').orgchart({
          'data' : url,
          visibleLevel:4,
          'collapsed': false,
          zoom: false,
          depth:4,
          chartClass:chartClass||"root",  
          pan: false,
          toggleSiblingsResp: false,
          nodeTemplate: nodeTemplate,
          'createNode': function($node, data) {
            if(!data.package){
              $($node).find(".title").addClass("inactive-node-title")
              $($node).find(".content").addClass("inactive-node-border")
              $($node).addClass('inactive-node')
            }

            if(!data.avi_id){
              $($node).find(".title").addClass("nouser-node-title")
              $($node).find(".content").addClass("nouser-node-border")
              $($node).addClass('nouser-node')
            }


            if(data.avi_id && data.className && data.className.match(/top-level/)) {
              $("#business_details").append($.parseHTML(businessDetailsTemplate(data,'root')));
              $("#sequence").html("root");
            } else if(data.className && data.className.match(/drill-up/)) {
                  $($node).addClass(data.avi_id) 
                var drillUpIcon = $('<i>', {
                  'class': 'fa fa-arrow-circle-up drill-icon',
                  'click': function() {
                    $('#chart-container').find('.orgchart:visible').remove();
                    var reverseList = $("#sequence").html().split("-");
                    var targetChart = reverseList[reverseList.length-2]
                    $("#business_"+reverseList[reverseList.length-1]).remove();
                    reverseList.pop();
                    $("#sequence").html(reverseList.join("-"))
                    $("."+targetChart).removeClass("hidden")
                    $("#business_"+targetChart).removeClass("hidden")
                  }
                });
                $node.append(drillUpIcon);
            } else  if(data.avi_id){
                $($node).addClass('drill-down');
                $($node).addClass(data.avi_id)
                var drillDownIcon = $('<i>', {
                  'class': 'fa fa-arrow-circle-down drill-icon',
                  'click': function() {
                    var reverseList = $("#sequence").html().split("-");
                    var targetChart = reverseList[reverseList.length-1]
                    $("#business_"+targetChart).addClass("hidden");
                    var sequenceList = $("#sequence").html();
                    $("#sequence").html(sequenceList+"-"+data.avi_id)
                    $('#chart-container').find('.orgchart:visible').addClass('hidden');
                    initOrgchart(data.id,data.avi_id)
                    $("#business_details").append($.parseHTML(businessDetailsTemplate(data,data.avi_id)));
                  }
                });
                $node.append(drillDownIcon);
              }
            }
        });
      }

      initOrgchart(1)
});
