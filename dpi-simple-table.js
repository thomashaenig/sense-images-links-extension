define(["jquery", "text!./dpi-simple-table.css"], function($, cssContent) {'use strict';
	$("<style>").html(cssContent).appendTo("head");
	return {
		initialProperties : {
			version : 1.0,
			qHyperCubeDef : {
				qDimensions : [],
				qMeasures : [],
				qInitialDataFetch : [{
					qWidth : 15,
					qHeight : 500
				}]
			}
		},
		definition : {
			type : "items",
			component : "accordion",
			items : {
				dimensions : {
					uses : "dimensions",
					min : 1
				},
				measures : {
					uses : "measures",
					min : 0
				},
				sorting : {
					uses : "sorting"
				},
				settings : {
					uses : "settings"
				},
				rawHTML : {
					label: 'Enable Raw Html',
					type: 'items',
					items : {
						html:{
						  type: "boolean",
						  component: "switch",
						  translation: "Enable Raw HTML Input",
						  ref: "htmlInput",
						  defaultValue: false,
						  trueOption: {
							  value: true,
							  translation: "properties.on"
							  },
						  falseOption: {
							  value: false,
							  translation: "properties.off"
							  },
						  show: true
						}
					}
				},
				linkOptions : {
					label: 'Link Options',
					type: 'items',
					items : {
						links:{
						  type: "boolean",
						  component: "switch",
						  translation: "Enable Links",
						  ref: "linkColumns",
						  defaultValue: true,
						  trueOption: {
							  value: true,
							  translation: "properties.on"
							  },
						  falseOption: {
							  value: false,
							  translation: "properties.off"
							  },
						  show: true
						},
						selectableLinksOption: {
						  	type: "boolean",
						  	component: "switch",
						  	translation: "Selectable Links",
							ref: "selectableLinks",
							defaultValue: false,
							trueOption: {
								value: true,
								translation: "properties.on"
								},
							falseOption: {
								value: false,
								translation: "properties.off"
								},
						 	show : function(data) {
								return data.linkColumns;
							}
						},
						customLinkLabeling: {
						  	type: "boolean",
						  	component: "switch",
						  	translation: "Custom Link Handling",
							ref: "linkLabel",
							defaultValue: false,
							trueOption: {
								value: true,
								translation: "properties.on"
								},
							falseOption: {
								value: false,
								translation: "properties.off"
								},
						 	show : function(data) {
								return data.linkColumns;
							}
						},
						delimiterOnOff: {
						  type: "boolean",
						  component: "switch",
						  translation: "Enable Delimiter",
						  ref: "delimiterSwitch",
						  defaultValue: false,
						  trueOption: {
							  value: true,
							  translation: "properties.on"
							  },
						  falseOption: {
							  value: false,
							  translation: "properties.off"
							  },
						 	show : function(data) {
								return data.linkLabel && data.linkColumns;
							}
						},
						customDelimiter: {
								ref : "delimiter",
								label : "Delimiter for Link Label",
								type : "string",
								defaultValue : '',
							 	show : function(data) {
									return data.linkLabel  && data.delimiterSwitch && data.linkColumns;
								}
						},
						staticLabelOnOff: {
						  type: "boolean",
						  component: "switch",
						  translation: "Enable Static Label",
						  ref: "labelSwitch",
						  defaultValue: false,
						  trueOption: {
							  value: true,
							  translation: "properties.on"
							  },
						  falseOption: {
							  value: false,
							  translation: "properties.off"
							  },
						 	show : function(data) {
								return data.linkLabel && data.linkColumns;
							}
						},
						customTitle: {
								ref : "customLabel",
								label : "Static title",
								type : "string",
								defaultValue : '',
							 	show : function(data) {
									return data.linkLabel  && data.labelSwitch && data.linkColumns;
								}
						}
					}
				},
				imageOptions : {
					label: 'Image Options',
					type: 'items',
					items : {
						images : {				
							  type: "boolean",
							  component: "switch",
							  translation: "Enable Embedded Images",
							  ref: "imageColumns",
							  defaultValue: true,
							  trueOption: {
								  value: true,
								  translation: "properties.on"
								  },
							  falseOption: {
								  value: false,
								  translation: "properties.off"
								  },
							  show: true
						},
						imageHeight: {
								ref : "imageHeight",
								label : "Image Height",
								type : "string",
								defaultValue : 100,
							 	show : function(data) {
									return data.imageColumns;
								}
						}
					}
				}
			}
		},
		snapshot : {
			canTakeSnapshot : true
		},
		paint : function($element, layout) {
			let calcHeight = $($element[0]).height()>0?$($element[0]).height()-25:0;
			var html = "<div class='root' style='height:"+calcHeight+"px'><div class='container'><table><thead><tr>", self = this, lastrow = 0, dimcount = this.backendApi.getDimensionInfos().length;

			let model = this.backendApi.model;
			let countDim = model.layout.qHyperCube.qDimensionInfo.length;
			let countMea = model.layout.qHyperCube.qMeasureInfo.length;
			let countTotal = countDim + countMea;

			function createGuid() {
				return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
					var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
					return v.toString(16);
				});
			};

			let arrId = [];
			for (let i = 0; i < countTotal; i++) {
				arrId[i] = createGuid();
			}

			let sort = model.layout.qHyperCube.qEffectiveInterColumnSortOrder;

			// handle link address and link labels depending on the link option settings
			function deriveLabels (input) {
				var address='';
				var label='';
				if(input !== undefined) {
					if (layout.linkLabel && layout.linkColumns) {
						if(layout.labelSwitch && layout.customLabel && layout.delimiterSwitch && layout.delimiter) {
							label = layout.customLabel;
							if(input.indexOf(layout.delimiter)>0) {
								address = input.slice(0,input.indexOf(layout.delimiter));
							}
							else {
								address = input;
							}						}
						else if(layout.delimiterSwitch && layout.delimiter) {
							if(input.indexOf(layout.delimiter)>0) {
								label = input.slice(input.indexOf(layout.delimiter)+1);
								address = input.slice(0,input.indexOf(layout.delimiter));
							}
							else {
								label = input;
								address = input;
							}
						}
						else if(layout.labelSwitch && layout.customLabel) {
							label = layout.customLabel;
							address = input;
						}
						else {
							label = input;
							address = input;
						}
					}
					else {
						label = input;
						address = input;
					}
				}
				return [label, address];
			}

			let counterKey = 0;
			//render titles
			$.each(this.backendApi.getDimensionInfos(), function(key, value) {
				html += "<th align='left'>" + value.qFallbackTitle + "<div id='"+arrId[counterKey]+"' onClick='test(" + key + ", \"D\")'>" + value.qFallbackTitle + "</div></th>";
				counterKey++;
			});
			$.each(this.backendApi.getMeasureInfos(), function(key, value) {
				html += "<th align='left'>" + value.qFallbackTitle + "<div id='"+arrId[counterKey]+"' onClick='test(" + key + ", \"M\")'>" + value.qFallbackTitle + "</div></th>";
				counterKey++;
			});
			html += "</tr></thead><tbody>";
			//render data
			this.backendApi.eachDataRow(function(rownum, row) {
				lastrow = rownum;
				html += '<tr>';
				$.each(row, function(key, cell) {
					if(cell.qIsOtherCell) {
						cell.qText = self.backendApi.getDimensionInfos()[key].othersLabel;
					}
					html += "<td class='";
					if(!isNaN(cell.qNum)) {
						html += "numeric ";
					}

					if (!layout.htmlInput) {
						var labelAddressArray = deriveLabels(cell.qText);
						var label = labelAddressArray[0];
						var address = labelAddressArray[1];
					
						// toggle selectable for links, so that when you click a link, it won't necessarily drill to it
						var selectable = '';

						if (layout.selectableLinks) {
							selectable = 'selectable'
						}
						else {
							if( ~address.slice(0,4).toLowerCase()==='http' ||
								~address.slice(0,3).toLowerCase()==='www' ||
								~address.toLowerCase().indexOf('.com') || 
								~address.toLowerCase().indexOf('.net')|| 
								~address.toLowerCase().indexOf('.edu') || 
								~address.toLowerCase().indexOf('.org') ||
								~address.toLowerCase().indexOf('.gov')
								) 
							{
								selectable = '';
							} 
							else {
									selectable = 'selectable';
							}
						}
					}
					else {
						var selectable = 'selectable';
						var address = '';
						var label = '';
					}
					// enable selectable

					let linkChecker = -1
					if (cell.qText) {
						let linkChecker = cell.qText.indexOf("<a href=");
					}

					if(key < dimcount && cell.qElemNumber > -1 && linkChecker === -1) {
						html += selectable + "' data-value='" + cell.qElemNumber + "' data-dimension='" + key + "'";
					} else {
						html += "'";
					}
					if(label !== undefined) {
						if (!layout.htmlInput) {
							//if just links is selected, check for links and convert
							if(layout.linkColumns && !layout.imageColumns){
								if(address.slice(0,4).toLowerCase()==='http'){
									html += '> <a href="' + address + '" target="_blank">' + label + '</a></td>';
								}
								else if(address.slice(0,3).toLowerCase()==='www'){
									html += '> <a href="http://' + address + '" target="_blank">' + label + '</a></td>';
								}
								else if(address.toLowerCase().indexOf('.com')>0 || address.toLowerCase().indexOf('.net')>0 || address.toLowerCase().indexOf('.edu')>0 || address.toLowerCase().indexOf('.gov')>0) {
									html += '> <a href="' + address + '" target="_blank">' + label + '</a></td>';
								}
								else{
									html += '>' + address + '</td>';
								}
							}
							//if just images is selected, check for images and convert
							else if(layout.imageColumns && !layout.linkColumns){
								if(~address.toLowerCase().indexOf('img.') || ~address.toLowerCase().indexOf('.jpg') || ~address.toLowerCase().indexOf('.gif') || ~address.toLowerCase().indexOf('.png')){
									html += '> <img src="' + address + '" height=' + layout.imageHeight + '></td>';
								}
								else{
									html += '>' + address + '</td>';
								}
							}
							//if both images and links are selected, if an image, convert and add a link
							//if not an image, just convert to link
							else if(layout.imageColumns && layout.linkColumns){
								if(~address.toLowerCase().indexOf('img.') || ~address.toLowerCase().indexOf('.jpg') || ~address.toLowerCase().indexOf('.gif') || ~address.toLowerCase().indexOf('.png')){
									html += '> <a href="' + address + '" target="_blank"><img src="' + label + '"" height=' + layout.imageHeight + '></a></td>';
								}
								else if(address.slice(0,4).toLowerCase()==='http'){
									html += '> <a href="' + address + '" target="_blank">' + label + '</a></td>';
								}
								else if(address.slice(0,3).toLowerCase()==='www'){
									html += '> <a href="http://' + address + '" target="_blank">' + label + '</a></td>';
								}
								else if(address.toLowerCase().indexOf('.com')>0 || address.toLowerCase().indexOf('.net')>0 || address.toLowerCase().indexOf('.edu')>0 || address.toLowerCase().indexOf('.gov')>0) {
									html += '> <a href="' + address + '" target="_blank">' + label + '</a></td>';
								}
								else{
									html += '>' + address + '</td>';
								}
							}
							//otherwise, no formatting
							else{
							html += '>' + address + '</td>';
							}
						}
						else {
							html += '>' + cell.qText + '</td>';
						}
					// value is undefined, fill with null value
					}
					else{
						html += '>' + '</td>';
					}

				});
				html += '</tr>';
			});
			html += "</tbody></table></div></div>";
			$element.html(html);
		  	$element.find('.selectable').on('qv-activate', function() {
				if(this.hasAttribute("data-value")) {
					var value = parseInt(this.getAttribute("data-value"), 10), dim = parseInt(this.getAttribute("data-dimension"), 10);
					self.selectValues(dim, [value], true);
					$element.find("[data-dimension='"+ dim +"'][data-value='"+ value+"']").toggleClass("selected");
				}
			});
			
			let sortByHead = sort[0]
			let headCheck = sortByHead;
			
			let indicator = "A"
			if (sortByHead >= countDim) {
				headCheck = sortByHead-countDim;
				indicator = model.layout.qHyperCube.qMeasureInfo[headCheck].qSortIndicator;
			} else {
				indicator = model.layout.qHyperCube.qDimensionInfo[headCheck].qSortIndicator;
			}

			$("#"+arrId[sort[0]]).append("<i class='lui-icon lui-icon--triangle-"+(indicator==="D"?"bottom":"top")+"'></i>")

			window.test = (key, type) => {

				let keyUpdated = key
				if(type==="M") {
					keyUpdated +=  countDim;
				}
				let sort = model.layout.qHyperCube.qEffectiveInterColumnSortOrder;


				if(keyUpdated===sort[0]) {

					let path = "";
					let val = false;

					if(type==="M") {
						path = "/qHyperCubeDef/qMeasures/"+key+"/qDef/qReverseSort"
						val = !model.layout.qHyperCube.qMeasureInfo[key].qReverseSort
					} else {
						path = "/qHyperCubeDef/qDimensions/"+key+"/qDef/qReverseSort"
						val = !model.layout.qHyperCube.qDimensionInfo[key].qReverseSort
					}

					model.enigmaModel.applyPatches([{
						qOp: "Replace",
						qPath: path,
						qValue: val.toString()
					}], true)
				} else {

					for (let i = 0; i < sort.length; i++) {
						if (sort[i] === keyUpdated) {
							sort = sort.slice(i, 1);
						}
					}
					sort.unshift(keyUpdated);
					
					let val = "[" + sort.join(",") + "]";
					model.enigmaModel.applyPatches([{
						qOp: "Replace",
						qPath: "/qHyperCubeDef/qInterColumnSortOrder",
						qValue: val
					}], true)
				}

			}
		}
	};
});







