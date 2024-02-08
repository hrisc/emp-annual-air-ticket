sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox"
], function(Controller, JSONModel, Filter, FilterOperator, MessageBox) {
	"use strict";
	var View = null;

	var sRootPath = jQuery.sap.getModulePath("ZANNUAL_TICKET"),
		i18nModel = new sap.ui.model.resource.ResourceModel({
			bundleUrl: [sRootPath, "i18n/i18n.properties"].join("/")
		});
	return Controller.extend("ZANNUAL_TICKET.controller.Create", {
		_setDetailView: function() {
			/* CR:9000001786:MOPH Air ticket Allowance:V1 - Start
			Using the array as the Odata structure is linear - Start.
			all the table structure is been push as single structure
			 Been used in Function onTableRowSelected - for keeping the count of the Child and wife 
			 1. Child - maximum 3 are allowed
			 2. Wife - maximum 1 is allowed
			 Author - L2_SANDEEPR
			 
			 */
			this.oTableSelectedModel = {
				child: [],
				spouse: [],
				self: []
			};
			//CR:9000001786:MOPH Air ticket Allowance:V1 - END
			return new JSONModel({
				busy: false,
				Country: null,
				CountryKey: null,
				RelType: "0",
				ticketIndex :undefined
			});
		},
		onInit: function() {
			this.oDataModel = this.getOwnerComponent().getModel("oDataModel");
			var oViewModel = this._setDetailView();
			this.getView().setModel(oViewModel, "detailView");
			this.oDataModel.setSizeLimit(10000);
			View = this.getView();
			View.setModel(this.oDataModel);
			var that = this;
			this.getView().getModel("detailView").setProperty("/busy", true);
			this.oDataModel.read("/HeaderSet('')", {
				urlParameters: {
					"$expand": "HTT,HTE,HTR"
				},
				success: function(oData) {
					this.getOwnerComponent().getModel("AnnualTicket").setProperty("/", oData);
					this.getView().getModel("detailView").setProperty("/Country", oData.HTT.results[0].CountryText);
					this.getView().getModel("detailView").setProperty("/CountryKey", oData.HTT.results[0].Country);
					var depResults = oData.HTT.results[0];
					var data = [{
						"Key": 0,
						"Depchk": depResults.Depchk0,
						"Fname": depResults.Fname0,
						"Rel": depResults.Rel0,
						"RelType": depResults.RelType0,
						"Dob": depResults.Dob0
					}, {
						"Key": 1,
						"Depchk": depResults.Depchk1,
						"Fname": depResults.Fname1,
						"Rel": depResults.Rel1,
						"RelType": depResults.RelType1,
						"Dob": depResults.Dob1
					}, {
						"Key": 2,
						"Depchk": depResults.Depchk2,
						"Fname": depResults.Fname2,
						"Rel": depResults.Rel2,
						"RelType": depResults.RelType2,
						"Dob": depResults.Dob2
					}, {
						"Key": 3,
						"Depchk": depResults.Depchk3,
						"Fname": depResults.Fname3,
						"Rel": depResults.Rel3,
						"RelType": depResults.RelType3,
						"Dob": depResults.Dob3
					}, {
						"Key": 4,
						"Depchk": depResults.Depchk4,
						"Fname": depResults.Fname4,
						"Rel": depResults.Rel4,
						"RelType": depResults.RelType4,
						"Dob": depResults.Dob4
					}, {
						"Key": 5,
						"Depchk": depResults.Depchk5,
						"Fname": depResults.Fname5,
						"Rel": depResults.Rel5,
						"RelType": depResults.RelType5,
						"Dob": depResults.Dob5
					}, {
						"Key": 6,
						"Depchk": depResults.Depchk6,
						"Fname": depResults.Fname6,
						"Rel": depResults.Rel6,
						"RelType": depResults.RelType6,
						"Dob": depResults.Dob6
					}, {
						"Key": 7,
						"Depchk": depResults.Depchk7,
						"Fname": depResults.Fname7,
						"Rel": depResults.Rel7,
						"RelType": depResults.RelType7,
						"Dob": depResults.Dob7
					}];

					this.getOwnerComponent().getModel("AnnualTicket").setProperty("/Dependents", data);
				}.bind(this),
				error: function(error) {
					var message;
					if (error.responseText.includes("<errordetails/>")) {
						if (error.responseText.includes("<message xml:lang=\"en\">")) {
							message = error.responseText.split('<message xml:lang=\"en\">')[1].split('</message>')[0];
						} else {
							message = error.message + " : " + error.responseText;
						}
					} else {
						message = JSON.parse(error.responseText).error.innererror.errordetails[0].message;
					}
					sap.m.MessageBox.error(
						message, {
							onClose: function(evt) {
								// window.location.hash = "";
								window.history.back();
							}
						});
				}.bind(this)
			});

			var oUploadCollection = this.getView().byId("UploadCollection");
			oUploadCollection.setFileType(["jpg", "png", "pdf", "PDF", "PNG", "JPG", "jPG", "BMP", "bmp", "TIF", "tif", "TIFF",
				"tiff",
				"JPEG", "jpeg", "dib", "DIB", "GIF", "gif"
			]);
			oUploadCollection.setMimeType = ["image/png", "image/jpeg", "application/pdf", "application/msword",
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/png", "application/vnd.ms-excel",
				"application/vnd.ms-excel", "image/bmp", "image/tiff", "image/gif"
			];
		},

		//Added by Sandeep after UAT changes
		_getEntityName: function(oEntityModel) {

			return new Promise(function(resolve, reject) {
				oEntityModel.read("/permissiontypeSet", {
					success: function(oResult) {
						// that.Bukrs =  oResult.results[0].Bukrs;
						resolve(oResult);
					},
					error: function(oError) {
						reject(oError);
					}
				});
			});

		},
		onAfterRendering: function() {
			var that = this;
			var oViewModel = new sap.ui.model.json.JSONModel({
				LpoPdf: "0"
			});
			this.getView().setModel(oViewModel, "oViewModel");

			this._setValueList();

		},
		_setValueList: function() {
			var oEntityModel = this.getView().getModel("entitySet");
			this._getEntityName(oEntityModel).then(function(oResult) {

				this.oDataModel.read("/ValueSet", {
					success: function(oData) {
						this.getOwnerComponent().getModel("AnnualTicket").setProperty("/ValueSet", oData.results);
						var valueRadio = View.byId("Value");
						var sFilter = [],
							sTableFilter = [];

						// var valueFilter = new Filter([
						// 	new Filter("Domname", FilterOperator.EQ, "Ticket Type")
						// ], false);
						this.sEntityName = oResult.results[0].Bukrs;
						if (this.sEntityName === "QA32") {

							sFilter.push(new Filter({

								filters: [
									new Filter("Domname", FilterOperator.EQ, "Ticket Type"),
									new Filter("DomvalueL", FilterOperator.NE, "1")
								],
								and: true

							}));

							sTableFilter.push(new Filter([
								new Filter("Key", FilterOperator.EQ, 0)
							], false));

							this._setFilterTableData(sTableFilter);

						} else {
							sFilter.push(new Filter([
								new Filter("Domname", FilterOperator.EQ, "Ticket Type")
							], false));
						}

						valueRadio.getBinding("buttons").filter(sFilter, "Application");
						// this.oFirstRadioButton = oData.results.filter( function(oReulst) {
						// 				return oReulst.Domname === "Ticket Type" ;

						// })[0].DomvalueL;
						// if(this.oFirstRadioButton === "2"){
						// 	View.byId("table").setVisible(false);
						// }
						this.getView().getModel("detailView").setProperty("/busy", false);

					}.bind(this),
					error: function(error) {
						this.getView().getModel("detailView").setProperty("/busy", false);
					}.bind(this)
				});
			}.bind(this));
		},
		dateFormatter: function(d) {

			var dd = d.split(".");
			var D = dd[2] + "-" + dd[1] + "-" + dd[0] + "T00:00:00";
			return D;

		},
		dateFormatter2: function(evtDate) {

			//"2015-08-09T00:00:00";

			var dd = evtDate.split(".");
			var d = dd[2] + "-" + dd[1] + "-" + dd[0] + "T00:00:00";
			return d;
		},
		onSubmit: function() {
			// if(this.getView().byId("table").getSelectedIndices().length > 3){
			// 	MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("MAX_3_ALLOWED"));
			// 	return;
			// }
			if (!this.getView().byId("table").getSelectedIndices().length && this.sEntityName === "QA32" && this.getView().byId("Value").getSelectedIndex() ===
				0) {
				sap.m.MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("NO_ITEM_SELECTED"));
				return;
			}

			var that = this;
			var formValid = true;
			var isAttached = true;
			var oEntry = {};
			$.each($('.mandatory'), function(index, elem) {
				var control = that.getView().byId(elem.id);
				if (control.getValue) {
					if (!control.getValue()) {
						formValid = false;
						if (!control.hasBeenValidatedBefore) {
							var valueStateMsg = control.mProperties.valueStateText + " " + i18nModel.getResourceBundle().getText("isMandatory");
							control.setValueStateText = valueStateMsg;
							control.hasBeenValidatedBefore = true;
						}
						control.setValueState("Error");
					} else {
						control.setValueState("None");
					}
				}
				if (formValid && control.aItems && Object.keys(control.aItems).length === 0) {
					sap.m.MessageBox.show(
						i18nModel.getResourceBundle().getText("no_attachment"), {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: i18nModel.getResourceBundle().getText("Error"),
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function(evt) {

							}
						});
					formValid = false;
					isAttached = false;
				}

			});

			if (!formValid && isAttached) {
				sap.m.MessageBox.show(
					i18nModel.getResourceBundle().getText("MandatoryFields"), {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: i18nModel.getResourceBundle().getText("Error"),
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function(evt) {}
					});
			}

			if (formValid) {

				var oTable = View.byId("table");
				var selectedIndices = oTable.getSelectedIndices();
				var i;
				var dep;
				if (selectedIndices.length > 0) {
					for (i = 1; i <= selectedIndices.length; i++) {
						dep = oTable.getContextByIndex(selectedIndices[i - 1]).getObject();
						if (dep.Fname !== "") {
							oEntry['Fname' + i] = dep.Fname;
							oEntry['Rel' + i] = dep.Rel;
							oEntry['Dob' + i] = dep.Dob;
							oEntry['Depchk' + i] = true;
						}
					}
				}
				/*else {
					formValid = false;
					sap.m.MessageBox.show(
						i18nModel.getResourceBundle().getText("SelectDependents"), {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: i18nModel.getResourceBundle().getText("Error"),
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function(evt) {

							}
						});
				}*/

			}

			if (formValid) {
				View.oBusy = new sap.m.BusyDialog();
				View.oBusy.open();
				oEntry.Depdate = this.dateFormatter2(View.byId("Depdate").getValue());
				oEntry.Travelto = View.byId("Travelto").getValue();
				oEntry.Porigin = View.byId("Porigin").getValue();
				if (View.byId("Redate").getValue() !== "") {
					oEntry.Redate = this.dateFormatter2(View.byId("Redate").getValue());
				}
				oEntry.Country = this.getView().getModel("detailView").getProperty("/CountryKey");
				// In case of QA32 employee there will be only 2 radio buttons visible
				//sandeep
				if (this.sEntityName === "QA32") {

					oEntry.Tkttyp = (View.byId("Value").getSelectedIndex() + 2).toString();

				} else {
					oEntry.Tkttyp = (View.byId("Value").getSelectedIndex() + 1).toString();
				}

				oEntry.Tkstyp = (View.byId("PaymentMethod").getSelectedIndex() + 1).toString();
				oEntry.Class = this.getOwnerComponent().getModel("AnnualTicket").getProperty("/HTT/results/0/Class");
				oEntry.Pernr = this.getOwnerComponent().getModel("AnnualTicket").getProperty("/HTE/results/0/Pernr");
				oEntry.Mobile = View.byId("Mobile").getValue();
				oEntry.Extn = View.byId("Extn").getValue();

				var oViewModel = this.getView().getModel("oViewModel");
				switch (oViewModel.getProperty("/LpoPdf")) {
					case "0":
						oEntry.LpoPdf = "";
						break;
					case "1":
						oEntry.LpoPdf = "X";
						break;
				}

				this.oDataModel.create("/SubmitDetailSet", oEntry, {
					success: function(success, response) {
						that.WorkId = success.Workitem;
						that.getView().byId("UploadCollection").upload();
						/*sap.m.MessageBox.show(
							"success", {
								onClose: function(evt) {

								}
							});*/
					},
					error: function(error, response) {
						View.oBusy.close();
						var message;
						if (error.responseText.includes("<errordetails/>")) {
							if (error.responseText.includes("<message xml:lang=\"en\">")) {
								message = error.responseText.split('<message xml:lang=\"en\">')[1].split('</message>')[0];
							} else {
								message = error.message + " : " + error.responseText;
							}
						} else {
							message = JSON.parse(error.responseText).error.message.value;
						}
						sap.m.MessageBox.error(
							message, {
								onClose: function(evt) {

								}
							});
					}
				});
			}

			//this.getView().byId("UploadCollection").upload();
		},
		onChangeValue: function(evt) {
			if (evt.getSource().getValue()) {
				evt.getSource().setValueState("None");
			}
		},
		_setFilterTableData: function(sFilter) {
			this.getView().byId("table").getBinding("rows").filter(sFilter, "Application");
			this.getView().byId("table").getModel().updateBindings();
		},
		onSelectedValueChange: function(evt) {
			// if (evt.getSource().getSelectedIndex() === 1) {
			// 	View.byId("table").setVisible(false);
			// } else {
			// 	View.byId("table").setVisible(true);
			// }
			this.getView().getModel("detailView").setProperty("/ticketIndex", evt.getParameter("selectedIndex") );
			if(this.oTableSelectedModel){
				this.oTableSelectedModel.child = [];
				this.oTableSelectedModel.self = [];
				this.oTableSelectedModel.spouse = [];
			}
			
			View.byId("table").setVisible(true);
			var sFilter = [];
			if (this.sEntityName === "QA32") {
				if (evt.getSource().getSelectedIndex() === 0) {

					sFilter.push(new Filter([
						new Filter("Key", FilterOperator.EQ, 0)
					], false));
					this._setFilterTableData(sFilter);
				} else {
					View.byId("table").setVisible(false);
				}

			} else {

				if (evt.getSource().getSelectedIndex() === 1) {

					sFilter.push(new Filter([
						new Filter("Key", FilterOperator.EQ, 0)
					], false));
					this._setFilterTableData(sFilter);

				} else if (evt.getSource().getSelectedIndex() === 0) {
					View.byId("table").setVisible(true);
					sFilter = [];
					this._setFilterTableData(sFilter);

				} else if (evt.getSource().getSelectedIndex() === 2) {
					View.byId("table").setVisible(false);
				}
			}

			if (evt.getSource().getSelectedIndex() === 2) {
				View.byId("Redate").setEditable(false);
			} else {
				View.byId("Redate").setEditable(true);
			}

			// if (this.oFirstRadioButton === "2") {
			// 	View.byId("table").setVisible(false);
			// } else {
			// 	View.byId("table").setVisible(true);
			// }
		},
		onPaymentMethodSelected: function(oEvent) {
			var oViewModel = this.getView().getModel("oViewModel");
			switch (oEvent.getSource().getSelectedIndex()) {
				case 0:
					oViewModel.setProperty("/LpoPdf", "0");
					break;
				case 1:
					oViewModel.setProperty("/LpoPdf", "1");
					break;

			}

			oViewModel.updateBindings();
		},
		onChangeAttachment: function(oEvent) {

			var oUploadCollection = oEvent.getSource();
			// Header Token
			var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZHCM_ANNUAL_TICKET_SRV/");
			// Header Token
			var token = oModel.getSecurityToken();
			// var token = this.getCSRFToken();
			var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
				name: "x-csrf-token",
				value: token
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);

		},

		onUploadComplete: function(oEvent) {
			//	var sUploadedFileName = oEvent.getParameter("files")[0].fileName;
			var that = this;

			if (oEvent.getParameters().getParameters().status === 201) {
				sap.m.MessageToast.show(i18nModel.getResourceBundle().getText("attachment_success"), {
					duration: 2000
				});
				setTimeout(function nav() {
					that.getView().oBusy.close();
					window.history.back();

				}, 2500);
			} else {
				sap.m.MessageToast.show(i18nModel.getResourceBundle().getText("attachment_not_successful"), {
					duration: 2000
				});
				setTimeout(function nav() {
					that.getView().oBusy.close();
					// window.location.hash = "";
					window.history.back();

				}, 2500);

			}
		},
		onBeforeUploadStarts: function(oEvent) {

			var workId = this.WorkId;
			var fileName = oEvent.getParameters().fileName;
			var imageName = fileName.substring(0, fileName.indexOf("."));
			var fileExt = fileName.substring(fileName.indexOf("."), fileName.length);
			fileExt = fileExt.slice(-3);
			var nFCount = oEvent.getSource().getItems().length;

			var mim = "B";
			var oSlugHeaderToken = new sap.m.UploadCollectionParameter({
				name: "SLUG",
				value: imageName + "|" + fileExt + "|" + mim + "|" + workId + "|" + nFCount
					//		value: imageName + "|" + fileExt + "|" + mim + "|" + nFCount
			});
			oEvent.getParameters().addHeaderParameter(oSlugHeaderToken);
		},

		/** 
		 * CR:9000001786:MOPH Air ticket Allowance:V1 - Start
		 * @param oEvent {sap.ui.base.Event} Fired if the row selection of the table has been changed.
		 * 
		 * We are using the event to catch all the User selection of rows on the table.
		 * by default only 3 childrens and 1 spouse is allowed.
		 * Using this approach as the OData does not have 1..* many mapping and only linear structure is been used.
		 * 
		 * 
		 */
		onTableRowSelected: function(oEvent) {
			var oContext;
			if(	this.getView().getModel("detailView").getProperty("/ticketIndex") === 0){
				if (oEvent.getParameters().rowContext.getObject().RelType === "5") {				// Children
				if (oEvent.getSource().isIndexSelected(oEvent.getParameters().rowIndex)) {
					oContext = oEvent.getParameter("rowContext").getObject();
					//Checking if the limit of 3 has reached.
					if (this.oTableSelectedModel.child.length === 3) {							
						oEvent.getSource().removeSelectionInterval(oEvent.getParameter("rowIndex"), oEvent.getParameter("rowIndex"));
						MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("MAX_3_ALLOWED"));

					} else {
						this.oTableSelectedModel.child.push(oContext);
					}

				} else {

					var iIndex = this.oTableSelectedModel.child.indexOf(oEvent.getParameter("rowContext").getObject());
					if (iIndex !== -1) {
						this.oTableSelectedModel.child.splice(iIndex, 1);
					}

				}
			} else if (oEvent.getParameters().rowContext.getObject().RelType === "1") {			//Spouse - Wife
				if (oEvent.getSource().isIndexSelected(oEvent.getParameters().rowIndex)) {
					oContext = oEvent.getParameter("rowContext").getObject();

					if (this.oTableSelectedModel.spouse.length === 1) {
						oEvent.getSource().removeSelectionInterval(oEvent.getParameter("rowIndex"), oEvent.getParameter("rowIndex"));
						MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("MAX_3_ALLOWED"));

					} else {
						this.oTableSelectedModel.spouse.push(oContext);
					}

				} else {
					this.oTableSelectedModel.spouse.pop();
				}
			}else if (oEvent.getParameters().rowContext.getObject().RelType === "0") {			//Spouse - Wife
				if (oEvent.getSource().isIndexSelected(oEvent.getParameters().rowIndex)) {
					oContext = oEvent.getParameter("rowContext").getObject();

					if (this.oTableSelectedModel.self.length === 1) {
						oEvent.getSource().removeSelectionInterval(oEvent.getParameter("rowIndex"), oEvent.getParameter("rowIndex"));
						MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("MAX_3_ALLOWED"));

					} else {
						this.oTableSelectedModel.self.push(oContext);
					}

				} else {
					this.oTableSelectedModel.self.pop();
				}
			}
	
			}
			
		}
		//CR:9000001786:MOPH Air ticket Allowance:V1 - END
	});
});