define(['./helper'], function (helper) {
  var link = {
    ref: "prop.vizId",
    label: "Base visualization",
    type: "string",
    component: "dropdown",
    options: function () {
      return helper.getMasterItems();
    }
  };

  var dimName = {
    ref: "prop.dimName",
    label: "Name of field for Dimensions",
    type: "string",
    expression: "optional",
    defaultValue: "Dimensions"
  };

  var mesName = {
    ref: "prop.mesName",
    label: "Name of field for Measures",
    type: "string",
    expression: "optional",
    defaultValue: "Measures"
  };

  var appearance = {
    uses: "settings",
    items: {
      general: {
        items: {
          showTitles: {
            defaultValue: false
          },
          details: {
            show: false
          }
        }
      },
      options: {
        type: "items",
        label: "Qwik table options",
        items: {
          link: link,
          dimName: dimName,
          mesName: mesName
        }
      }
    }
  };

  var aboutDefinition = {
    component: 'items',
    label: 'About',
    items: {
      header: {
        label: 'Qwik Table',
        style: 'header',
        component: 'text'
      },
      paragraph1: {
        label: `An easy way to create a standard customised table in Qlik Sense`,
        component: 'text'
      },
      paragraph2: {
        label: 'Created by Riley MacDonald.',
        component: 'text'
      }
    }
  };

  return {
    type: "items",
    component: "accordion",
    items: {
      appearance: appearance,
      about: aboutDefinition
    }
  };
});