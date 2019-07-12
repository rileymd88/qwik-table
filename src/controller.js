/* eslint-disable max-len */
/* eslint-disable no-console */
var qlik = window.require('qlik');
import $ from 'jquery';
import helper from './helper.js';
import popoverTemplate from './popover.ng.html';

export default ['$scope', '$element', function ($scope, $element) {
  $scope.layoutId = $scope.layout.qInfo.qId;
  let enigma = $scope.component.model.enigmaModel;
  let app = qlik.currApp($scope);


  $scope.layout.getScope = function () {
    return $scope;
  };

  $scope.$watch("layout.prop.vizId", function (newValue, oldValue) {
    if (newValue !== oldValue) {
      if (newValue) {
        $scope.onMasterVizSelected(newValue);
      }
    }
  });

  $scope.$watch("layout.prop.dimName", function (newValue, oldValue) {
    $scope.dimName = newValue;
  });

  $scope.$watch("layout.prop.mesName", function (newValue, oldValue) {
    $scope.mesName = newValue;
  });

  helper.getMasterItems().then(function (items) {
    $scope.masterVizs = items;
    $scope.showMasterVizSelect = true;
  });

  $scope.showAddMasterItemsDialog = function (event) {
    var items = $scope.masterVizs;
    $scope.masterItemPopover = window.qvangularGlobal.getService("luiPopover").show({
      template: popoverTemplate,
      alignTo: event.target,
      closeOnEscape: true,
      closeOnOutside: true,
      input: {
        items: items,
        onClick: function (item) {
          try {
            if (item.value) {
              $scope.onMasterVizSelected(item.value);
            }
          }
          finally {
            $scope.masterItemPopover.close();
          }
        }
      }
    });
    $scope.masterItemPopover.closed.then(function () {
      $(window).off('resize.popover', $scope.onMasterItemPopoverResize);
    });
    $(window).on('resize.popover', $scope.onMasterItemPopoverResize);
  };

  $scope.onMasterItemPopoverResize = function () {
    if ($scope.masterItemPopover) {
      $scope.masterItemPopover.close();
    }
  };

  // Function to get string expressions
  $scope.getExpression = function (expression) {
    return new Promise(function (resolve, reject) {
      try {
        app.createGenericObject({
          expression: {
            qStringExpression: expression
          }
        }, function (reply) {
          resolve(reply.expression);
        });
      }
      catch (err) {
        reject(err);
      }
    });
  };

  $scope.generateRandomId = function () {
    let random = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return random;
  };

  $scope.onMasterVizSelected = async function (masterViz) {
    try {
      // Get table
      let tableObject = await enigma.app.getObject(masterViz);
      // Get table properties
      let tableProps = await tableObject.getProperties();
      // Get table dimension and measure labels
      let dimensionLabels = [];
      for (let d = 0; d < tableProps.qHyperCubeDef.qDimensions.length; d++) {
        // Master item
        if (tableProps.qHyperCubeDef.qDimensions[d].qLibraryId.length > 1) {
          let masterDimension = await enigma.app.getDimension(tableProps.qHyperCubeDef.qDimensions[d].qLibraryId);
          let masterDimensionProps = await masterDimension.getLayout();
          // Check for drilldown
          let label;
          try {
            label = masterDimensionProps.qDim.title.replaceAll(",", " ").replaceAll("[", " ").replaceAll("]", " ").replaceAll("(", " ").replaceAll(")", " ");
          }
          catch {
            label = masterDimensionProps.qDim.qFieldLabels[0].replaceAll(",", " ").replaceAll("[", " ").replaceAll("]", " ").replaceAll("(", " ").replaceAll(")", " ");
          }
          dimensionLabels.push({ "label": label, "id": $scope.generateRandomId() });
        }
        // Not a master item
        else {
          // Has label
          if (tableProps.qHyperCubeDef.qDimensions[d].qDef.qFieldLabels[0].length > 1) {
            let label = tableProps.qHyperCubeDef.qDimensions[d].qDef.qFieldLabels[0].replaceAll(",", " ").replaceAll("[", " ").replaceAll("]", " ").replaceAll("(", " ").replaceAll(")", " ");
            dimensionLabels.push({ "label": label, "id": $scope.generateRandomId() });
          }
          // No label
          else {
            let label = tableProps.qHyperCubeDef.qDimensions[d].qDef.qFieldDefs[0].replaceAll(",", " ").replaceAll("[", " ").replaceAll("]", " ").replaceAll("(", " ").replaceAll(")", " ");
            dimensionLabels.push({ "label": label, "id": $scope.generateRandomId() });
          }
        }
      }
      let measureLabels = [];
      for (let m = 0; m < tableProps.qHyperCubeDef.qMeasures.length; m++) {
        // Master item
        if (tableProps.qHyperCubeDef.qMeasures[m].qLibraryId.length > 1) {
          let masterMeasure = await enigma.app.getMeasure(tableProps.qHyperCubeDef.qMeasures[m].qLibraryId);
          let masterMeasureProps = await masterMeasure.getProperties();
          // Has label
          if (masterMeasureProps.qMeasure.qLabel.length > 1) {
            let label = masterMeasureProps.qMeasure.qLabel.replaceAll(",", " ").replaceAll("[", " ").replaceAll("]", " ").replaceAll("(", " ").replaceAll(")", " ");
            measureLabels.push({ "label": label, "id": $scope.generateRandomId() });
          }
          // Has expression
          else {
            let expressionValue = await $scope.getExpression(masterMeasureProps.qMeasure.qLabelExpression);
            measureLabels.push(expressionValue);
          }
        }
        // Not a master item
        else {
          // Has label
          if (tableProps.qHyperCubeDef.qMeasures[m].qDef.qLabel.length > 1) {
            let label = tableProps.qHyperCubeDef.qMeasures[m].qDef.qLabel.replaceAll(",", " ").replaceAll("[", " ").replaceAll("]", " ").replaceAll("(", " ").replaceAll(")", " ");
            measureLabels.push({ "label": label, "id": $scope.generateRandomId() });
          }
          // Expression
          else if (tableProps.qHyperCubeDef.qMeasures[m].qDef.qLabelExpression.length > 1) {
            let expressionValue = await $scope.getExpression(tableProps.qHyperCubeDef.qMeasures[m].qDef.qLabelExpression);
            let label = expressionValue.replaceAll(",", " ").replaceAll("[", " ").replaceAll("]", " ").replaceAll("(", " ").replaceAll(")", " ");
            measureLabels.push({ "label": label, "id": $scope.generateRandomId() });
          }
          // No label or expression
          else {
            let label = tableProps.qHyperCubeDef.qMeasures[m].qDef.qDef.replaceAll(",", " ").replaceAll("[", " ").replaceAll("]", " ").replaceAll("(", " ").replaceAll(")", " ");
            measureLabels.push({ "label": label, "id": $scope.generateRandomId() });
          }
        }
      }
      // Add new data islands
      let loadScript = "///$tab Qwik Table\r\n";
      loadScript += `[${$scope.dimName}]:\rLOAD * INLINE [\r`;
      loadScript += `${$scope.dimName}, ${$scope.dimName}ID\r`;
      for (let dl = 0; dl < dimensionLabels.length; dl++) {
        loadScript += `${dimensionLabels[dl].label}, ${dimensionLabels[dl].id}\r`;
      }
      loadScript += `]\r;`;
      loadScript += `\r[${$scope.mesName}]:\rLOAD * INLINE [\r`;
      loadScript += `${$scope.mesName}, ${$scope.mesName}ID\r`;
      for (let ml = 0; ml < measureLabels.length; ml++) {
        loadScript += `${measureLabels[ml].label}, ${measureLabels[ml].id}\r`;
      }
      loadScript += `]\r;`;
      let currentLoadScript = await enigma.app.getScript();
      loadScript = currentLoadScript + loadScript;
      await enigma.app.setScript(loadScript);
      deleteReload();
      await enigma.app.doReload();
      await enigma.app.doSave();
      // Transform table props into new flexible table
      let newTableProps = JSON.parse(JSON.stringify(tableProps));
      for (let dc = 0; dc < newTableProps.qHyperCubeDef.qDimensions.length; dc++) {
        newTableProps.qHyperCubeDef.qDimensions[dc].qCalcCondition.qCond.qv = `=SubStringCount(Concat([${$scope.dimName}ID], '|'), '${dimensionLabels[dc].id}')`;
      }
      for (let mc = 0; mc < newTableProps.qHyperCubeDef.qMeasures.length; mc++) {
        newTableProps.qHyperCubeDef.qMeasures[mc].qCalcCondition.qCond.qv = `=SubStringCount(Concat([${$scope.mesName}ID], '|'), '${measureLabels[mc].id}')`;
      }
      newTableProps.qHyperCubeDef.qCalcCond = `GetSelectedCount([${$scope.dimName}]) > 0 and GetSelectedCount([${$scope.mesName}]) > 0`;
      newTableProps.qHyperCubeDef.qCalcCondition.qCond.qv = `GetSelectedCount([${$scope.dimName}]) > 0 and GetSelectedCount([${$scope.mesName}]) > 0`;
      newTableProps.qHyperCubeDef.qCalcCondition.qMsg.qv = "Please select your dimensions and measures";
      newTableProps.qInfo.qId = $scope.layoutId;
      newTableProps.qInfo.qType = 'table';
      newTableProps.qMetaDef = {};
      let thisObject = await enigma.app.getObject($scope.layoutId);
      thisObject.setProperties(newTableProps);
      let sheetId = qlik.navigation.getCurrentSheetId().sheetId;
      let sheetObject = await enigma.app.getObject(sheetId);
      let dimName = $scope.dimName;
      let mesName = $scope.mesName;
      let dimensionListbox = await app.visualization.create('listbox', null, {
        qListObjectDef: {
          qDef: {
            qFieldDefs: [dimName]
          }
        }
      });
      let dimensionListboxId = dimensionListbox.id;
      let measureListbox = await app.visualization.create('listbox', null, {
        qListObjectDef: {
          qDef: {
            qFieldDefs: [mesName]
          }
        }
      });
      
      let measureListboxId = measureListbox.id;
      let filterProps = {
        "qInfo": {
          "qId": "",
          "qType": "filterpane"
        },
        "qExtendsId": "",
        "qMetaDef": {},
        "qStateName": "",
        "qChildListDef": {
          "qData": {
            "info": "/qInfo"
          }
        },
        "showTitles": false,
        "title": "",
        "subtitle": "",
        "footnote": "",
        "showDetails": false,
        "visualization": "filterpane"
      };
      let filterViz = await sheetObject.createChild(filterProps);
      let filterObject = await enigma.app.getObject(filterViz.id);
      let filterFullProps = {
        "qPropEntry": {
          "qProperty": {
            "qInfo": {
              "qId": filterViz.id,
              "qType": "filterpane"
            },
            "qExtendsId": "",
            "qMetaDef": {},
            "qStateName": "",
            "qChildListDef": {
              "qData": {
                "info": "/qInfo"
              }
            },
            "showTitles": false,
            "title": "",
            "subtitle": "",
            "footnote": "",
            "showDetails": false,
            "visualization": "filterpane"
          },
          "qChildren": [
            {
              "qProperty": {
                "qInfo": {
                  "qId": dimensionListboxId,
                  "qType": "listbox"
                },
                "qExtendsId": "",
                "qMetaDef": {},
                "qStateName": "",
                "qListObjectDef": {
                  "qStateName": "",
                  "qLibraryId": "",
                  "qDef": {
                    "qGrouping": "N",
                    "qFieldDefs": [
                      `${dimName}`
                    ],
                    "qFieldLabels": [
                      `${dimName}`
                    ],
                    "qSortCriterias": [
                      {
                        "qSortByState": 1,
                        "qSortByFrequency": 0,
                        "qSortByNumeric": 1,
                        "qSortByAscii": 1,
                        "qSortByLoadOrder": 1,
                        "qSortByExpression": 0,
                        "qExpression": {
                          "qv": ""
                        },
                        "qSortByGreyness": 0
                      }
                    ],
                    "qNumberPresentations": [],
                    "qReverseSort": false,
                    "qActiveField": 0,
                    "qLabelExpression": "",
                    "autoSort": true,
                    "cId": "LPCpjpJ"
                  },
                  "qAutoSortByState": null,
                  "qFrequencyMode": "N",
                  "qShowAlternatives": true,
                  "qInitialDataFetch": [],
                  "qExpressions": [],
                  "qOtherTotalSpec": {}
                },
                "showTitles": true,
                "title": dimName,
                "subtitle": "",
                "footnote": "",
                "showDetails": false,
                "visualization": "listbox"
              },
              "qChildren": [],
              "qEmbeddedSnapshotRef": null
            },
            {
              "qProperty": {
                "qInfo": {
                  "qId": measureListboxId,
                  "qType": "listbox"
                },
                "qExtendsId": "",
                "qMetaDef": {},
                "qStateName": "",
                "qListObjectDef": {
                  "qStateName": "",
                  "qLibraryId": "",
                  "qDef": {
                    "qGrouping": "N",
                    "qFieldDefs": [
                      `${mesName}`
                    ],
                    "qFieldLabels": [
                      `${mesName}`
                    ],
                    "qSortCriterias": [
                      {
                        "qSortByState": 1,
                        "qSortByFrequency": 0,
                        "qSortByNumeric": 1,
                        "qSortByAscii": 1,
                        "qSortByLoadOrder": 1,
                        "qSortByExpression": 0,
                        "qExpression": {
                          "qv": ""
                        },
                        "qSortByGreyness": 0
                      }
                    ],
                    "qNumberPresentations": [],
                    "qReverseSort": false,
                    "qActiveField": 0,
                    "qLabelExpression": "",
                    "autoSort": true,
                    "cId": "TPfcJvP"
                  },
                  "qAutoSortByState": null,
                  "qFrequencyMode": "N",
                  "qShowAlternatives": true,
                  "qInitialDataFetch": [],
                  "qExpressions": [],
                  "qOtherTotalSpec": {}
                },
                "showTitles": true,
                "title":  mesName,
                "subtitle": "",
                "footnote": "",
                "showDetails": false,
                "visualization": "listbox"
              },
              "qChildren": [],
              "qEmbeddedSnapshotRef": null
            }
          ],
          "qEmbeddedSnapshotRef": null
        }
      };
      filterObject.setFullPropertyTree(filterFullProps);
      let filterId = filterViz.id;
      let sheetProps = await sheetObject.getProperties();
      sheetProps = JSON.parse(JSON.stringify(sheetProps));
      let col;
      let row;
      let rowspan;
      for (var c = 0; c < sheetProps.cells.length; c++) {
        if (sheetProps.cells[c].name == $scope.layoutId) {
          delete sheetProps.cells[c].bounds;
          sheetProps.cells[c].type = 'table';
          col = sheetProps.cells[c].col;
          sheetProps.cells[c].col = col + 3;
          row = sheetProps.cells[c].row;
          sheetProps.cells[c].colspan = sheetProps.cells[c].colspan - 3;
          rowspan = sheetProps.cells[c].rowspan;
          break;
        }
      }
      let newFilterCell = {
        "col": col,
        "colspan": 3,
        "name": filterId,
        "row": row,
        "rowspan": rowspan,
        "type": "filterpane"
      };
      sheetProps.cells.push(newFilterCell);
      await sheetObject.setProperties(sheetProps);
    }
    catch (err) {
      console.log(err);
    }
  };

  String.prototype.replaceAll = function (searchStr, replaceStr) {
    var str = this;
    // no match exists in string?
    if (str.indexOf(searchStr) === -1) {
      // return string
      return str;
    }
    // replace and remove first match, and do another recursirve search/replace
    return (str.replace(searchStr, replaceStr)).replaceAll(searchStr, replaceStr);
  };
  function deleteReload() {
    if (document.querySelector(".ui-dialog-container") != null) {
      $(".ui-dialog-container").remove();
      return "OK";
    }
    else {
      setTimeout(function () {
        deleteReload();
      }, 100);
    }
  }
}];